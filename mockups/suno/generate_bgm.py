"""
MoonIdle BGM 10트랙 생성 — sunoapi.org
사용법: python generate_bgm.py
API 키는 SUNOAPI_KEY 환경변수 또는 스크립트 옵션으로 설정
"""

import os
import sys
import time
import json
import io
import cloudscraper

# Windows 콘솔 UTF-8 출력 강제 설정 (cp949 우회)
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Cloudflare 우회 세션 (TLS 지문 + JS 챌린지 자동 처리)
_scraper = cloudscraper.create_scraper(
    browser={"browser": "chrome", "platform": "windows", "mobile": False}
)

# ── 설정 ──────────────────────────────────────────────────────────────────
API_KEY    = os.environ.get("SUNOAPI_KEY", "")
BASE_URL   = "https://api.sunoapi.org"
MODEL      = "V4_5ALL"
OUT_DIR    = os.path.join(os.path.dirname(__file__), "out")
POLL_SEC   = 15      # 폴링 간격 (초)
MAX_WAIT   = 300     # 최대 대기 (초)

# ── 10트랙 정의 ───────────────────────────────────────────────────────────
TRACKS = [
    {
        "id":    "bgm_01_early_drive",
        "title": "Early Drive",
        "style": "industrial electronic, driving minor key, synth bass, machine rhythm, focused energy, 134 bpm",
        "desc":  "초반 생산 허브 — D-minor 134 BPM 집중 드라이브",
    },
    {
        "id":    "bgm_02_research_grid",
        "title": "Research Grid",
        "style": "cyberpunk, glitchy arpeggio, minimal techno, analytical, A minor, 110 bpm",
        "desc":  "연구 탭 — A-minor 110 BPM 사이버 그리드",
    },
    {
        "id":    "bgm_03_launch_tension",
        "title": "Launch Tension",
        "style": "pounding industrial bass, countdown tension, E minor, urgent driving, 145 bpm",
        "desc":  "발사 카운트다운 — E-minor 145 BPM 극도의 긴장",
    },
    {
        "id":    "bgm_04_assembly_focus",
        "title": "Assembly Focus",
        "style": "mechanical precision, factory rhythm, minimal dark techno, C minor, 120 bpm",
        "desc":  "조립 탭 — C-minor 120 BPM 정밀 기계음",
    },
    {
        "id":    "bgm_05_mid_ambient",
        "title": "Mid Ambient",
        "style": "space ambient, vast drone pads, slow evolving atmosphere, G minor, 90 bpm",
        "desc":  "중반 확장기 — G-minor 90 BPM 광활한 앰비언트",
    },
    {
        "id":    "bgm_06_automation_hum",
        "title": "Automation Hum",
        "style": "industrial hum, repetitive machine loop, steady background, F minor, 100 bpm",
        "desc":  "자동화 완성 — F-minor 100 BPM 기계 허밍",
    },
    {
        "id":    "bgm_07_mission_epic",
        "title": "Mission Epic",
        "style": "epic orchestral electronic hybrid, triumphant, soaring, D major, 125 bpm",
        "desc":  "미션 클리어 — D-major 125 BPM 장엄한 승리",
    },
    {
        "id":    "bgm_08_prestige_void",
        "title": "Prestige Void",
        "style": "ethereal space void, haunting pads, slow evolving, minimalist, B minor, 60 bpm",
        "desc":  "프레스티지/리셋 — B-minor 60 BPM 공허한 에테르",
    },
    {
        "id":    "bgm_09_moon_approach",
        "title": "Moon Approach",
        "style": "deep space mystery, tense atmospheric build, F sharp minor, cinematic, 115 bpm",
        "desc":  "달 접근 — F#-minor 115 BPM 신비로운 긴장",
    },
    {
        "id":    "bgm_10_moon_surface",
        "title": "Moon Surface",
        "style": "triumphant victory, electronic orchestral, epic landing, A major, 130 bpm",
        "desc":  "달 표면 달성 — A-major 130 BPM 승리의 도착",
    },
]

# ── 유틸 ──────────────────────────────────────────────────────────────────
def api_call(method, path, body=None):
    url = BASE_URL + path
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "Origin": "https://sunoapi.org",
        "Referer": "https://sunoapi.org/",
    }
    try:
        if method == "GET":
            r = _scraper.get(url, headers=headers, timeout=30)
        else:
            r = _scraper.post(url, headers=headers, json=body, timeout=30)
        if r.status_code >= 400:
            print(f"  [HTTP {r.status_code}] {r.text[:300]}")
            return None
        return r.json()
    except Exception as e:
        print(f"  [ERR] {e}")
        return None

def download_file(url, dest_path):
    r = _scraper.get(url, timeout=60)
    r.raise_for_status()
    with open(dest_path, "wb") as f:
        f.write(r.content)

# ── 태스크 상태 조회 ───────────────────────────────────────────────────────
def get_task_status(task_id):
    """sunoapi.org 상태 조회 엔드포인트"""
    return api_call("GET", f"/api/v1/generate/record-info?taskId={task_id}")

# ── 메인 ──────────────────────────────────────────────────────────────────
def main():
    global API_KEY
    if not API_KEY:
        print("[ERROR] SUNOAPI_KEY 환경변수가 설정되지 않았습니다.")
        print("  set SUNOAPI_KEY=your_api_key  (Windows)")
        print("  export SUNOAPI_KEY=your_api_key  (Linux/Mac)")
        sys.exit(1)

    os.makedirs(OUT_DIR, exist_ok=True)
    print(f"=== MoonIdle BGM 생성 시작: {len(TRACKS)}트랙 ===")
    print(f"출력 폴더: {OUT_DIR}\n")

    submitted = []  # [(track_info, task_id)]

    # ── 1단계: 전체 요청 전송 ────────────────────────────────────────────
    for track in TRACKS:
        print(f"[요청] {track['id']}: {track['desc']}")
        payload = {
            "customMode":  True,
            "instrumental": True,
            "model":        MODEL,
            "callBackUrl":  "https://httpbin.org/post",   # 더미 콜백 (폴링 사용)
            "title":        track["title"],
            "style":        track["style"],
            "negativeTags": "vocals, singing, voice, lyrics, rap, spoken word",
        }
        result = api_call("POST", "/api/v1/generate", payload)
        if result and result.get("code") == 200:
            task_id = result["data"]["taskId"]
            print(f"  → taskId: {task_id}")
            submitted.append((track, task_id))
        else:
            print(f"  [FAIL] {result}")
        time.sleep(1)  # 요청 간격

    print(f"\n{len(submitted)}/{len(TRACKS)} 요청 완료. 생성 대기 중...\n")

    # ── 2단계: 폴링으로 완료 확인 및 다운로드 ───────────────────────────
    pending = list(submitted)
    done    = []
    start   = time.time()

    while pending and (time.time() - start) < MAX_WAIT:
        time.sleep(POLL_SEC)
        still_pending = []
        for track, task_id in pending:
            status = get_task_status(task_id)
            if not status:
                still_pending.append((track, task_id))
                continue

            # 완료 상태 확인 (API마다 구조 다를 수 있음)
            data = status.get("data", {})
            s    = (data.get("status") or status.get("status") or "").upper()

            # 완료된 경우: data.response.sunoData[] 구조
            songs = None
            if isinstance(data, dict):
                response = data.get("response") or {}
                suno_data = response.get("sunoData") or []
                if suno_data:
                    songs = suno_data

            if songs:
                print(f"[완료] {track['id']} ({len(songs)}곡)")
                for i, song in enumerate(songs):
                    audio_url = song.get("audioUrl") or song.get("sourceAudioUrl") or song.get("streamAudioUrl") or ""
                    if audio_url:
                        suffix = f"_v{i+1}" if i > 0 else ""
                        dest = os.path.join(OUT_DIR, f"{track['id']}{suffix}.mp3")
                        print(f"  다운로드: {audio_url}")
                        try:
                            download_file(audio_url, dest)
                            print(f"  저장: {dest}")
                        except Exception as e:
                            print(f"  [다운로드 실패] {e}")
                done.append(track["id"])
            elif s in ("PENDING", "RUNNING", "PROCESSING", "SUBMITTED", ""):
                still_pending.append((track, task_id))
                print(f"  대기 중: {track['id']} (status={s or 'unknown'})")
            else:
                print(f"  [상태 알 수 없음] {track['id']}: {json.dumps(status)[:200]}")
                still_pending.append((track, task_id))

        pending = still_pending
        if pending:
            elapsed = int(time.time() - start)
            print(f"  [{elapsed}s] 남은 트랙: {len(pending)}개\n")

    # ── 3단계: 결과 요약 ─────────────────────────────────────────────────
    print("\n=== 결과 요약 ===")
    print(f"완료: {len(done)}/{len(TRACKS)}")
    for f in sorted(os.listdir(OUT_DIR)):
        if f.endswith(".mp3"):
            fpath = os.path.join(OUT_DIR, f)
            size  = os.path.getsize(fpath) // 1024
            print(f"  {f} ({size} KB)")
    if pending:
        print(f"\n미완료 ({len(pending)}개):")
        for t, tid in pending:
            print(f"  {t['id']} (taskId={tid})")

if __name__ == "__main__":
    main()
