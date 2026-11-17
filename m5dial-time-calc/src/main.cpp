// 時間差計算（M5Stack Dial 版）
//
// ホーム画面：1つめ・2つめの開始／終了時刻と時間差、その下に2つの合計
//   つまみをまわす ………… 時刻をえらぶ（青い枠が動く）
//   画面を押しこむ・時刻をタップ … その時刻を変える
//   長押し ………………… ぜんぶリセット（確認あり）
// 時刻を変える画面（時計の文字盤）
//   つまみをまわす or 指でなぞる …… 時→分の順に合わせる
//   指を離す or 押しこむ ……………… 決定（時→分→ホームへ）
//   長押し ………………………………… この時刻を消す
#include <M5Dial.h>
#include <Preferences.h>
#include <math.h>

// ---- 調整用 ----
static constexpr int ENC_STEP = 4;          // つまみ1カチッで増える数。1カチッで4つ動くときは 1 に
static constexpr int ENC_DIR = 1;           // まわす向きが逆なら -1 に
static constexpr bool CLICK_SOUND = true;   // まわしたときのカチッという音
static constexpr uint32_t DIM_MS = 60000;   // さわらないと画面を暗くするまでの時間
static constexpr uint8_t BRIGHT = 160, DIMMED = 12;

// ---- 色（アプリと同じ） ----
static constexpr uint32_t C_BG = 0x020617u, C_FIELD = 0x1f293au, C_LINE = 0x3a4459u;
static constexpr uint32_t C_TEXT = 0xf8fafcu, C_MUTED = 0x94a3b8u, C_ACCENT = 0x24b081u;
static constexpr uint32_t C_SUM = 0xfbbf24u, C_SUMBG = 0x1a1405u, C_PICK = 0x0a84ffu;
static constexpr uint32_t C_DIAL = 0x3f3f46u, C_DIALBG = 0x1c1c1eu, C_INNER = 0xc8c8c8u;

static constexpr int CX = 120, CY = 120;    // 画面の中心
static constexpr int R_OUT = 98, R_IN = 64; // 外側の輪（00・13〜23時・分）と内側の輪（12・1〜11時）

enum Mode { HOME, EDIT_H, EDIT_M, CONFIRM_RESET };
Mode mode = HOME;

int16_t times[4] = {14 * 60 + 23, 17 * 60 + 9, -1, -1};  // 分。-1 は未入力
const char* NAMES[4] = {"1つめ 開始", "1つめ 終了", "2つめ 開始", "2つめ 終了"};
int cursor = 0, editIdx = 0, editH = 0, editM = 0;

M5Canvas cv(&M5Dial.Display);
Preferences prefs;
long encLast = 0;
int encAcc = 0;
uint32_t lastInput = 0;
bool dimmed = false, dirty = true, dragging = false, ignoreTouch = false;

// ---------------------------------------------------------------
void save() {
  prefs.begin("timecalc", false);
  prefs.putBytes("t", times, sizeof(times));
  prefs.end();
}
void load() {
  prefs.begin("timecalc", true);
  if (prefs.getBytesLength("t") == sizeof(times)) prefs.getBytes("t", times, sizeof(times));
  prefs.end();
}
void tick() {
  if (CLICK_SOUND) M5Dial.Speaker.tone(6000, 8);
}
int diffOf(int a, int b) {
  if (a < 0 || b < 0) return -1;
  int d = b - a;
  return d < 0 ? d + 24 * 60 : d;  // 終了が早いときは翌日
}
void fmtTime(char* buf, size_t n, int v) {
  if (v < 0) snprintf(buf, n, "--:--");
  else snprintf(buf, n, "%02d:%02d", v / 60, v % 60);
}
void fmtHM(char* buf, size_t n, int m) {
  if (m < 0) snprintf(buf, n, "--");
  else snprintf(buf, n, "%d時間%d分", m / 60, m % 60);
}
void text(const char* s, int x, int y, uint32_t color, const lgfx::IFont* font) {
  cv.setFont(font);
  cv.setTextColor(color);
  cv.setTextDatum(middle_center);
  cv.drawString(s, x, y);
}

// ---- ホーム画面 ----
static constexpr int BOX_W = 84, BOX_H = 30;
int colX(int c) { return c ? 166 : 74; }
int boxY(int i) { return (i % 2) ? 98 : 62; }  // 上端

void drawHome() {
  cv.fillScreen(C_BG);
  char buf[24];
  text("時間差計算", CX, 24, C_MUTED, &fonts::lgfxJapanGothic_12);
  for (int c = 0; c < 2; c++) {
    int x = colX(c);
    text(c ? "2つめ" : "1つめ", x, 47, C_TEXT, &fonts::lgfxJapanGothic_16);
    for (int k = 0; k < 2; k++) {
      int i = c * 2 + k, y = boxY(i);
      cv.fillRoundRect(x - BOX_W / 2, y, BOX_W, BOX_H, 8, C_FIELD);
      if (i == cursor) {
        cv.drawRoundRect(x - BOX_W / 2 - 1, y - 1, BOX_W + 2, BOX_H + 2, 9, C_PICK);
        cv.drawRoundRect(x - BOX_W / 2, y, BOX_W, BOX_H, 8, C_PICK);
      } else {
        cv.drawRoundRect(x - BOX_W / 2, y, BOX_W, BOX_H, 8, C_LINE);
      }
      fmtTime(buf, sizeof buf, times[i]);
      text(buf, x, y + BOX_H / 2 + 1, times[i] < 0 ? C_MUTED : C_TEXT, &fonts::FreeSansBold12pt7b);
    }
    fmtHM(buf, sizeof buf, diffOf(times[c * 2], times[c * 2 + 1]));
    text(buf, x, 145, C_ACCENT, &fonts::lgfxJapanGothic_16);
  }
  // 2つの合計
  int sum = 0, count = 0;
  for (int c = 0; c < 2; c++) {
    int d = diffOf(times[c * 2], times[c * 2 + 1]);
    if (d >= 0) { sum += d; count++; }
  }
  cv.fillRoundRect(50, 160, 140, 54, 12, C_SUMBG);
  cv.drawRoundRect(50, 160, 140, 54, 12, C_SUM);
  cv.drawRoundRect(51, 161, 138, 52, 11, C_SUM);
  text("2つの合計", CX, 173, C_SUM, &fonts::lgfxJapanGothic_12);
  fmtHM(buf, sizeof buf, count ? sum : -1);
  text(buf, CX, 197, C_SUM, &fonts::lgfxJapanGothic_24);
}

// ---- 時計の文字盤 ----
void polar(float ang, int r, int& x, int& y) {
  x = CX + lroundf(sinf(ang) * r);
  y = CY - lroundf(cosf(ang) * r);
}
void drawPicker() {
  cv.fillScreen(C_DIALBG);
  cv.fillCircle(CX, CY, 117, C_DIAL);
  bool hourMode = (mode == EDIT_H);
  float ang;
  int r;
  if (hourMode) {
    ang = (editH % 12) * (float)M_PI / 6;
    r = (editH == 0 || editH > 12) ? R_OUT : R_IN;
  } else {
    ang = editM * (float)M_PI / 30;
    r = R_OUT;
  }
  int x0, y0, x1, y1;
  polar(ang, 40, x0, y0);
  polar(ang, r, x1, y1);
  cv.drawWideLine(x0, y0, x1, y1, 1.5f, C_PICK);
  cv.fillCircle(x1, y1, 16, C_PICK);

  char buf[8];
  for (int i = 0; i < 12; i++) {
    int x, y;
    float a = i * (float)M_PI / 6;
    polar(a, R_OUT, x, y);
    if (hourMode && i == 0) snprintf(buf, sizeof buf, "00");
    else if (hourMode) snprintf(buf, sizeof buf, "%d", i + 12);
    else snprintf(buf, sizeof buf, "%02d", i * 5);
    text(buf, x, y + 1, C_TEXT, &fonts::FreeSans9pt7b);
    if (hourMode) {
      polar(a, R_IN, x, y);
      snprintf(buf, sizeof buf, "%d", i == 0 ? 12 : i);
      text(buf, x, y, C_INNER, &fonts::lgfxJapanGothic_12);
    }
  }
  // まん中：どの時刻か と 今の値（変えている所を白く）
  text(NAMES[editIdx], CX, 104, C_INNER, &fonts::lgfxJapanGothic_12);
  char hs[4], ms[4];
  snprintf(hs, sizeof hs, "%02d", editH);
  snprintf(ms, sizeof ms, "%02d", editM);
  cv.setFont(&fonts::FreeSansBold12pt7b);
  int wh = cv.textWidth(hs), wc = cv.textWidth(":"), wm = cv.textWidth(ms);
  int left = CX - (wh + wc + wm) / 2;
  cv.setTextDatum(middle_left);
  cv.setTextColor(hourMode ? C_TEXT : C_MUTED);
  cv.drawString(hs, left, 128);
  cv.setTextColor(C_MUTED);
  cv.drawString(":", left + wh, 128);
  cv.setTextColor(hourMode ? C_MUTED : C_TEXT);
  cv.drawString(ms, left + wh + wc, 128);
  text(hourMode ? "時" : "分", CX, 150, C_PICK, &fonts::lgfxJapanGothic_12);
}

void drawConfirm() {
  cv.fillScreen(C_BG);
  text("ぜんぶリセット？", CX, 90, C_TEXT, &fonts::lgfxJapanGothic_20);
  text("押しこむ：リセット", CX, 132, C_SUM, &fonts::lgfxJapanGothic_16);
  text("まわす・タップ：やめる", CX, 158, C_MUTED, &fonts::lgfxJapanGothic_16);
}

// ---- 操作 ----
void applyEdit() { times[editIdx] = editH * 60 + editM; }

void openEdit(int i) {
  editIdx = i;
  int v = times[i];
  if (v < 0) v = times[i ^ 1] >= 0 ? times[i ^ 1] : 9 * 60;  // 空なら、組の相手の時刻から
  editH = v / 60;
  editM = v % 60;
  applyEdit();
  mode = EDIT_H;
  dirty = true;
}
void advance() {  // 決定：時→分→ホーム
  if (mode == EDIT_H) {
    mode = EDIT_M;
  } else {
    applyEdit();
    save();
    cursor = (editIdx + 1) % 4;  // つぎの時刻へ
    mode = HOME;
  }
  dirty = true;
}
void setFromTouch(int x, int y) {
  float dx = x - CX, dy = y - CY;
  float ang = atan2f(dx, -dy);
  if (ang < 0) ang += 2 * (float)M_PI;
  int before = (mode == EDIT_H) ? editH : editM;
  if (mode == EDIT_H) {
    int i = (int)lroundf(ang / ((float)M_PI / 6)) % 12;
    bool inner = hypotf(dx, dy) < (R_IN + R_OUT) / 2;
    editH = inner ? (i == 0 ? 12 : i) : (i == 0 ? 0 : i + 12);
  } else {
    editM = (int)lroundf(ang / ((float)M_PI / 30)) % 60;
  }
  if (((mode == EDIT_H) ? editH : editM) != before) {
    tick();
    applyEdit();
    dirty = true;
  }
}
int hitBox(int x, int y) {
  for (int i = 0; i < 4; i++) {
    int bx = colX(i / 2) - BOX_W / 2, by = boxY(i);
    if (x >= bx - 4 && x <= bx + BOX_W + 4 && y >= by - 4 && y <= by + BOX_H + 4) return i;
  }
  return -1;
}

// ---------------------------------------------------------------
void setup() {
  auto cfg = M5.config();
  M5Dial.begin(cfg, true, false);  // つまみ：使う、RFID：使わない
  M5Dial.Display.setBrightness(BRIGHT);
  M5Dial.Speaker.setVolume(64);
  M5Dial.BtnA.setHoldThresh(1200);
  cv.setColorDepth(16);
  cv.createSprite(240, 240);
  load();
  encLast = M5Dial.Encoder.read();
  lastInput = millis();
}

void loop() {
  M5Dial.update();

  long pos = M5Dial.Encoder.read();
  encAcc += (int)(pos - encLast) * ENC_DIR;
  encLast = pos;
  int steps = encAcc / ENC_STEP;
  encAcc -= steps * ENC_STEP;

  auto td = M5Dial.Touch.getDetail();
  bool btnClick = M5Dial.BtnA.wasClicked(), btnHold = M5Dial.BtnA.wasHold();
  bool touching = td.isPressed();

  if (steps || btnClick || btnHold || touching) {
    lastInput = millis();
    if (dimmed) {  // 暗いときは、明るくするだけ
      dimmed = false;
      M5Dial.Display.setBrightness(BRIGHT);
      if (touching) ignoreTouch = true;
      return;
    }
  }
  if (ignoreTouch) {
    if (!touching) ignoreTouch = false;
    td = decltype(td)();
  }

  switch (mode) {
    case HOME:
      if (steps) {
        cursor = ((cursor + steps) % 4 + 4) % 4;
        tick();
        dirty = true;
      }
      if (btnClick) openEdit(cursor);
      if (btnHold) { mode = CONFIRM_RESET; dirty = true; }
      if (td.wasClicked()) {
        int i = hitBox(td.x, td.y);
        if (i >= 0) { cursor = i; openEdit(i); }
      }
      break;

    case EDIT_H:
    case EDIT_M:
      if (steps) {
        if (mode == EDIT_H) editH = ((editH + steps) % 24 + 24) % 24;
        else editM = ((editM + steps) % 60 + 60) % 60;
        applyEdit();
        tick();
        dirty = true;
      }
      if (td.wasPressed() && hypotf(td.x - CX, td.y - CY) > 30) dragging = true;
      if (dragging && td.isPressed()) setFromTouch(td.x, td.y);
      if (dragging && td.wasReleased()) {  // 指を離したら決定
        dragging = false;
        setFromTouch(td.x, td.y);
        advance();
      }
      if (btnClick) advance();
      if (btnHold) {  // 長押しでこの時刻を消す
        times[editIdx] = -1;
        save();
        mode = HOME;
        dragging = false;
        dirty = true;
      }
      break;

    case CONFIRM_RESET:
      if (btnClick) {
        for (auto& v : times) v = -1;
        save();
        cursor = 0;
        mode = HOME;
        dirty = true;
      } else if (steps || td.wasClicked()) {
        mode = HOME;
        dirty = true;
      }
      break;
  }

  if (!dimmed && millis() - lastInput > DIM_MS) {
    dimmed = true;
    M5Dial.Display.setBrightness(DIMMED);
  }

  if (dirty) {
    dirty = false;
    if (mode == HOME) drawHome();
    else if (mode == CONFIRM_RESET) drawConfirm();
    else drawPicker();
    cv.pushSprite(0, 0);
  }
  delay(5);
}
