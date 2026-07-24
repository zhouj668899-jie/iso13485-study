#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
从 ISO 13485:2016 中文官方 PDF 抽取全文，结构化为标准条款(standard.json)
与术语表(terms.json)。

要点:
- 跳过目录(TOC)页: 含大量点引导线 + 页码的行。
- 处理术语排版: "3.1" 独占一行、下一行才是术语名。
- 跳过重复章节(附录对照表中出现的对方标准条款)。
- 附录内仅接受以附录字母开头的子标题，过滤对照表噪声。

运行: <venv>/bin/python extract_pdf.py
依赖: pymupdf (fitz)
"""
import fitz
import json
import re
import os
from datetime import datetime, timezone

BASE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PDF = os.path.join(BASE, "ISO 13485：2016 医疗器械-质量管理体系用于法规的要求.pdf")
OUT_DIR = os.path.join(BASE, "src", "data")
os.makedirs(OUT_DIR, exist_ok=True)

NOISE = re.compile(
    r'(ISO\s*13485:2016|©\s*ISO\s*2016|All rights reserved|INTERNATIONAL\s*STANDARD|'
    r'质量管理体系——用于法规的要求|医疗器械——质量管理体系|'
    r'Dispositifs|Exigences|Reference number|第\d+\s*版|www\.iso\.org)',
    re.I,
)
PAGE_NUM = re.compile(r'^(\d{1,3}|[ivxlc]+)$', re.I)
NUM_HEADING = re.compile(r'^(\d+(?:\.\d+)*)\s+([\u4e00-\u9fff(].*)$')
APPENDIX_HEADING = re.compile(r'^附录\s*([A-Da-d])\s*(.*)$')
SPECIAL_HEADING = re.compile(r'^(前言|引言|参考文献)$')
STANDALONE_NUM = re.compile(r'^(\d+(?:\.\d+)*)\s*$')
CJK_START = re.compile(r'^[\u4e00-\u9fff(]')
TOC_DOTS = re.compile(r'[\.…]{3,}\s*\d+\s*$')
TOC_LINE = re.compile(r'^\d+(\.\d+)*\s+.*[\.…]{3,}\s*\d+\s*$')

VALID_CHAPTER_NUMS = {"1", "2", "3", "4", "5", "6", "7", "8"}


def is_noise(s: str) -> bool:
    if NOISE.search(s) or PAGE_NUM.match(s):
        return True
    return False


def make_chapter_id(number: str) -> str:
    safe = re.sub(r'[^\w\u4e00-\u9fff]', '-', number)
    return "ch-" + safe


def clean_title(t: str) -> str:
    return re.sub(r'\s+', ' ', t).strip().rstrip('.').strip()


doc = fitz.open(PDF)
chapters = []
clauses = []
seen_chapters = set()
cur_chapter = None
cur_clause = None
para_lines = []
pending_num = None


def flush_para():
    global para_lines
    if para_lines and cur_clause is not None:
        line = "\n".join(para_lines).strip()
        if line:
            cur_clause["body"].append(line)
    para_lines = []


def new_chapter(number, title):
    global cur_chapter
    ch = {"id": make_chapter_id(number), "number": number, "title": title}
    chapters.append(ch)
    cur_chapter = ch
    return ch


def start_clause(number, title, level):
    global cur_clause
    flush_para()
    clause = {
        "id": number,
        "number": number,
        "title": title,
        "level": level,
        "chapterId": cur_chapter["id"] if cur_chapter else None,
        "chapterTitle": cur_chapter["title"] if cur_chapter else None,
        "body": [],
    }
    clauses.append(clause)
    cur_clause = clause


for pno in range(doc.page_count):
    text = doc[pno].get_text("text")
    # 跳过目录页
    lines = text.split("\n")
    toc_count = sum(
        1 for ln in lines if TOC_DOTS.search(ln.strip()) or TOC_LINE.match(ln.strip())
    )
    if toc_count >= 4:
        continue

    for raw in lines:
        s = raw.strip()
        if not s:
            flush_para()
            continue
        if is_noise(s):
            continue

        m_app = APPENDIX_HEADING.match(s)
        m_special = SPECIAL_HEADING.match(s)
        m_num = NUM_HEADING.match(s)

        heading = None
        hlevel0 = False

        if m_app:
            num = "附录 " + m_app.group(1).upper()
            ttl = clean_title(m_app.group(2)) or num
            heading = (num, ttl)
            hlevel0 = True
        elif m_special:
            heading = (s, s)
            hlevel0 = True
        elif m_num and len(s) <= 60:
            num = m_num.group(1)
            ttl = clean_title(m_num.group(2))
            dots = num.count(".")
            if dots == 0 and num in VALID_CHAPTER_NUMS:
                heading = (num, ttl)
                hlevel0 = True
            elif dots >= 1:
                heading = (num, ttl)

        # 编号独占一行 -> 下一行接术语名 (仅在已进入正文章节后)
        if heading is None and pending_num is not None and cur_chapter is not None and CJK_START.match(s):
            heading = (pending_num, clean_title(s))
            hlevel0 = False
            pending_num = None

        # 独立编号行 -> 暂存 (仅在已进入正文章节后)
        if heading is None and cur_chapter is not None and STANDALONE_NUM.match(s):
            pending_num = STANDALONE_NUM.match(s).group(1)
            continue

        if heading:
            pending_num = None
            num, ttl = heading
            if hlevel0:
                if num in seen_chapters:
                    para_lines.append(s)
                    continue
                seen_chapters.add(num)
                new_chapter(num, ttl)
                lvl = 0 if (num.startswith("附录") or num in ("前言", "引言", "参考文献")) else 1
                start_clause(num, ttl, lvl)
            else:
                dots = num.count(".")
                # 附录内仅接受以附录字母开头的子标题
                if cur_chapter and "附录" in cur_chapter["number"]:
                    letter = cur_chapter["number"].replace("附录 ", "")
                    if not (num.startswith(letter + ".") or num == letter):
                        para_lines.append(s)
                        continue
                if cur_chapter is None:
                    new_chapter("未分类", "未分类")
                start_clause(num, ttl, dots + 1)
        else:
            para_lines.append(s)

flush_para()

# 去重 clause id
seen = {}
for c in clauses:
    base = c["id"]
    if base in seen:
        seen[base] += 1
        c["id"] = f"{base}-{seen[base]}"
    else:
        seen[base] = 0

# 术语：第 3 章(level==2) 子条款
terms = []
for c in clauses:
    if c["chapterId"] == make_chapter_id("3") and c["level"] == 2:
        terms.append(
            {
                "term": c["title"],
                "definition": "\n".join(c["body"]),
                "number": c["number"],
                "chapter": "3",
            }
        )

meta = {
    "title": "ISO 13485:2016 医疗器械 质量管理体系 用于法规的要求",
    "standard": "ISO 13485:2016",
    "lang": "zh-CN",
    "source": "ISO 13485：2016 医疗器械-质量管理体系用于法规的要求.pdf",
    "extractedAt": datetime.now(timezone.utc).isoformat(),
    "pageCount": doc.page_count,
}

with open(os.path.join(OUT_DIR, "standard.json"), "w", encoding="utf-8") as f:
    json.dump({"meta": meta, "chapters": chapters, "clauses": clauses}, f, ensure_ascii=False, indent=1)

with open(os.path.join(OUT_DIR, "terms.json"), "w", encoding="utf-8") as f:
    json.dump(terms, f, ensure_ascii=False, indent=1)

print("章节数:", len(chapters))
for ch in chapters:
    print("  ", ch["number"], ch["title"])
print("条款数:", len(clauses))
print("术语数:", len(terms))
