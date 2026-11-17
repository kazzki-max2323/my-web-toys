// M5Stack Dial 用の机に置くスタンド（時間差計算）
// 数字を変えて大きさを合わせられます。単位は mm。
// 印刷：底面を下にそのまま置く。サポートなしで印刷できる形。PLA・0.2mm・充填20%くらい。

/* [本体の大きさ] — 手持ちの M5Stack Dial を測って合わせる */
body_d     = 45.0;   // 本体の直径（M5Stack Dial は約45mm）
clearance  = 0.4;    // すき間（きつければ大きく、ゆるければ小さく）
pocket_h   = 12.0;   // 本体を差しこむ深さ（まわすリングにかからない深さに）

/* [スタンドの形] */
tilt       = 30;     // 手前へのかたむき（度）
wall       = 3.0;    // 本体まわりの壁の厚さ
base_w     = 72;     // 台の幅
base_d     = 70;     // 台の奥行き
base_h     = 6;      // 台の厚さ
corner_r   = 8;      // 台の角の丸み

/* [USB ケーブルの通り道] */
usb_slot_w = 14;     // ケーブル差しこみ口のぶんの切りかき幅
usb_angle  = 0;      // 切りかきの向き（0=うしろ上側、180=手前下側、90・270=横）
cable_d    = 6;      // ケーブルを通す溝の太さ

$fn = 96;

pocket_d = body_d + clearance * 2;
cup_d    = pocket_d + wall * 2;
lift     = cup_d / 2 * sin(tilt) + pocket_h * cos(tilt);   // カップの手前下が台にめりこまない高さ

module rounded_box(w, d, h, r) {
  linear_extrude(h) offset(r) square([w - 2 * r, d - 2 * r], center = true);
}

// カップ（本体を差しこむ所）の座標：画面が手前ななめ上を向くようにかたむける
// カップの中で +y がうしろ上側、-y が手前下側
module cup_frame() {
  translate([0, 4, base_h + lift]) rotate([tilt, 0, 0]) children();
}

difference() {
  // 台＋カップを1つのかたまりに（カップのふちから台までなめらかにつなぐ）
  hull() {
    rounded_box(base_w, base_d, base_h, corner_r);
    cup_frame() translate([0, 0, -pocket_h]) cylinder(d = cup_d, h = pocket_h);
  }
  // 本体を入れる穴（底は2mm残す）
  cup_frame() translate([0, 0, -pocket_h + 2]) cylinder(d = pocket_d, h = pocket_h + 1);
  // USB 差しこみ口の切りかき（usb_angle=0 でうしろ上側）
  cup_frame() rotate([0, 0, usb_angle]) translate([-usb_slot_w / 2, 0, -pocket_h + 2])
    cube([usb_slot_w, cup_d, pocket_h + 1]);
  // ケーブルの溝（切りかきの外側から台のうしろへ）
  hull() {
    cup_frame() rotate([0, 0, usb_angle]) translate([0, cup_d / 2 + 1, -pocket_h / 2]) sphere(d = cable_d);
    translate([0, base_d / 2 + 1, base_h + cable_d / 2]) sphere(d = cable_d);
  }
  // 底のすべり止めを貼るくぼみ（直径10mm）
  for (x = [-1, 1], y = [-1, 1]) translate([x * (base_w / 2 - 10), y * (base_d / 2 - 10), -0.01]) cylinder(d = 10.4, h = 0.6);
}
