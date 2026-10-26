// tailwind.css の作り方（index.html を直したら作りなおす）：
//   cd postal-guide && npx tailwindcss@3.4.17 -c tailwind.config.js -i tailwind.in.css -o tailwind.css --minify
module.exports={content:['./index.html'],theme:{extend:{colors:{jpost:{red:'#E60012',darkred:'#B3000E',lightbg:'#FFF8F8',gray:'#2C2C2C',lightgray:'#F5F5F7'}}}}}
