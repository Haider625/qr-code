const QRCode = require('qrcode');
const sharp = require('sharp');
const path = require('path');

// الرابط الذي تريد تحويله إلى رمز QR
const url = ' https://zingy-gingersnap-91417c.netlify.app/';

// المسارات للصور
const logoPath = path.join(__dirname, 'a.jpg'); // تأكد من وجود الصورة في المجلد
const outputPath = path.join(__dirname, 'qrcode_with_logo_sharp.png');

// إعداد الخيارات لتوليد رمز QR
const qrOptions = {
  errorCorrectionLevel: 'H', // أعلى مستوى تصحيح الأخطاء للسماح بإضافة الشعار
  type: 'png',
  width: 800,
  margin: 1,
  color: {
    dark: '#2B807D',  // اللون الأساسي (أسود)
    light: '#FFFFFF00'   // جعل الخلفية شفافة
  }
};

// إعدادات الدائرة
const circleDiameter = 200; // قطر الدائرة البيضاء بالبيكسل
const circleRadius = circleDiameter / 2;
const borderWidth = 5; // سمك البوردر بالبيكسل
const borderColor = '#2B807D'; // لون البوردر

async function generateQRCodeWithLogoSharp() {
  try {
    // توليد رمز QR كـ Buffer
    const qrBuffer = await QRCode.toBuffer(url, qrOptions);
    console.log('تم إنشاء رمز QR بنجاح.');

    // تحميل صورة الشعار وتغيير حجمها
    const logoBuffer = await sharp(logoPath)
      .resize(160, 160, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } }) // ضبط الحجم حسب الحاجة
      .png()
      .toBuffer();

    // إنشاء دائرة بيضاء مع بوردر باستخدام SVG
    const svgCircle = `
      <svg width="${circleDiameter}" height="${circleDiameter}">
        <circle cx="${circleRadius}" cy="${circleRadius}" r="${circleRadius - borderWidth}" fill="white" stroke="${borderColor}" stroke-width="${borderWidth}" />
      </svg>
    `;
    const circleBuffer = Buffer.from(svgCircle);

    // دمج الشعار مع الدائرة البيضاء
    const logoWithCircleBuffer = await sharp(circleBuffer)
      .composite([{ input: logoBuffer, gravity: 'center' }])
      .png()
      .toBuffer();

    // دمج الدائرة مع الشعار في وسط رمز QR
    await sharp(qrBuffer)
      .composite([{ input: logoWithCircleBuffer, gravity: 'center' }])
      .png()
      .toFile(outputPath);

    console.log('تم إنشاء رمز QR مع الشعار والبوردر وحفظه كـ qrcode_with_logo_sharp.png');
  } catch (err) {
    console.error('حدث خطأ أثناء إنشاء رمز QR مع الشعار باستخدام sharp:', err);
  }
}

generateQRCodeWithLogoSharp();
