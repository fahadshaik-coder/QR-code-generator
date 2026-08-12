const input = document.getElementById('input');
const form = document.querySelector('.generator-form');
const imageInput = document.getElementById('image-input');
const imageButton = document.getElementById('image-generate-btn');
const imagePreviewWrapper = document.getElementById('image-preview-wrapper');
const imagePreview = document.getElementById('image-preview');
const imageFilename = document.getElementById('image-filename');
const removeImageBtn = document.getElementById('remove-image-btn');

const sizeInput = document.getElementById('size-input');
const sizeValue = document.getElementById('size-value');
const colorDarkInput = document.getElementById('color-dark');
const colorLightInput = document.getElementById('color-light');
const colorDarkHex = document.getElementById('color-dark-hex');
const colorLightHex = document.getElementById('color-light-hex');

const presetBtns = document.querySelectorAll('.preset-btn');
const resetBtn = document.getElementById('reset-btn');

const qrCodeContainer = document.getElementById('qr-code-container');
const qrStatus = document.getElementById('qr-status');
const qrWindow = document.getElementById('qr-window');
const downloadBtn = document.getElementById('download-btn');

let currentLogoImg = null;
let currentLogoDataUrl = null;

function getQRCodeOptions() {
  const size = Number(sizeInput?.value || 220);
  return {
    width: size,
    height: size,
    colorDark: colorDarkInput?.value || '#3b2c2e',
    colorLight: colorLightInput?.value || '#fcf5f2',
    correctLevel: typeof QRCode !== 'undefined' ? QRCode.CorrectLevel.H : 3,
  };
}

function updateColorHexLabels() {
  if (colorDarkHex && colorDarkInput) {
    colorDarkHex.textContent = colorDarkInput.value.toUpperCase();
  }
  if (colorLightHex && colorLightInput) {
    colorLightHex.textContent = colorLightInput.value.toUpperCase();
  }
}

const presetActiveName = document.getElementById('preset-active-name');

function updatePresetActiveState() {
  const currentDark = colorDarkInput?.value?.trim()?.toLowerCase();
  const currentLight = colorLightInput?.value?.trim()?.toLowerCase();
  const buttons = document.querySelectorAll('.preset-btn');
  let matchedName = 'Custom';

  buttons.forEach((btn) => {
    const btnDark = btn.getAttribute('data-dark')?.trim()?.toLowerCase();
    const btnLight = btn.getAttribute('data-light')?.trim()?.toLowerCase();
    const name = btn.getAttribute('data-name') || btn.getAttribute('title');

    if (btnDark === currentDark && btnLight === currentLight) {
      btn.classList.add('active');
      matchedName = name;
    } else {
      btn.classList.remove('active');
    }
  });

  if (presetActiveName) {
    presetActiveName.textContent = matchedName;
  }
}

function renderQRCode() {
  const value = input?.value?.trim() || 'https://example.com';
  const size = Number(sizeInput?.value || 220);
  const colorDark = colorDarkInput?.value || '#3b2c2e';
  const colorLight = colorLightInput?.value || '#fcf5f2';

  if (sizeValue) {
    sizeValue.textContent = `${size}px`;
  }

  updateColorHexLabels();
  updatePresetActiveState();

  if (qrWindow) {
    qrWindow.style.backgroundColor = colorLight;
  }

  qrStatus.textContent = 'Generating QR code...';
  qrCodeContainer.innerHTML = '';

  if (typeof QRCode === 'undefined') {
    qrStatus.textContent = 'The QR library could not load. Please refresh the page.';
    return;
  }

  new QRCode(qrCodeContainer, {
    text: value,
    width: size,
    height: size,
    colorDark: colorDark,
    colorLight: colorLight,
    correctLevel: QRCode.CorrectLevel.H,
  });

  // Give DOM a frame to ensure Canvas is rendered
  requestAnimationFrame(() => {
    const canvas = qrCodeContainer.querySelector('canvas');

    if (canvas && currentLogoImg) {
      const ctx = canvas.getContext('2d');
      const logoSize = Math.floor(size * 0.24);
      const x = (size - logoSize) / 2;
      const y = (size - logoSize) / 2;
      const padding = 4;
      const bgSize = logoSize + padding * 2;
      const bgX = x - padding;
      const bgY = y - padding;

      // Draw background frame for logo
      ctx.fillStyle = colorLight;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(bgX, bgY, bgSize, bgSize, 8);
      } else {
        ctx.rect(bgX, bgY, bgSize, bgSize);
      }
      ctx.fill();

      ctx.strokeStyle = colorDark;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw logo image
      ctx.drawImage(currentLogoImg, x, y, logoSize, logoSize);

      // Keep <img> synced if QRCode created one
      const img = qrCodeContainer.querySelector('img');
      if (img) {
        img.src = canvas.toDataURL('image/png');
        img.style.display = 'block';
        canvas.style.display = 'none';
      }
    }

    qrStatus.textContent = currentLogoImg
      ? 'QR code ready with custom logo!'
      : 'QR code ready.';
  });
}

function handleImageSelect(file) {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const result = e.target?.result;
    if (typeof result === 'string') {
      currentLogoDataUrl = result;
      const img = new Image();
      img.onload = () => {
        currentLogoImg = img;
        if (imagePreview) imagePreview.src = result;
        if (imageFilename) imageFilename.textContent = file.name;
        if (imagePreviewWrapper) imagePreviewWrapper.classList.remove('hidden');
        renderQRCode();
      };
      img.src = result;
    }
  };
  reader.readAsDataURL(file);
}

function removeImage() {
  currentLogoImg = null;
  currentLogoDataUrl = null;
  if (imageInput) imageInput.value = '';
  if (imagePreview) imagePreview.src = '';
  if (imageFilename) imageFilename.textContent = '';
  if (imagePreviewWrapper) imagePreviewWrapper.classList.add('hidden');
  renderQRCode();
}

function downloadQRCode() {
  const canvas = qrCodeContainer.querySelector('canvas');
  const img = qrCodeContainer.querySelector('img');

  let dataUrl = null;

  if (canvas) {
    dataUrl = canvas.toDataURL('image/png');
  } else if (img && img.src) {
    dataUrl = img.src;
  }

  if (!dataUrl) {
    alert('Please generate a QR code first.');
    return;
  }

  const link = document.createElement('a');
  link.download = 'qr-code.png';
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Helper to set colors programmatically and trigger render
function setColors(darkHex, lightHex) {
  if (darkHex && colorDarkInput) {
    colorDarkInput.value = darkHex;
  }
  if (lightHex && colorLightInput) {
    colorLightInput.value = lightHex;
  }
  renderQRCode();
}

// Event Listeners for Live Updates
colorDarkInput?.addEventListener('input', renderQRCode);
colorDarkInput?.addEventListener('change', renderQRCode);
colorLightInput?.addEventListener('input', renderQRCode);
colorLightInput?.addEventListener('change', renderQRCode);
sizeInput?.addEventListener('input', renderQRCode);
input?.addEventListener('input', renderQRCode);

imageInput?.addEventListener('change', (e) => {
  const file = e.target?.files?.[0];
  if (file) {
    handleImageSelect(file);
  }
});

removeImageBtn?.addEventListener('click', removeImage);

// Event delegation on preset badges container for maximum reliability & hover preview
const presetBadges = document.getElementById('preset-badges');

presetBadges?.addEventListener('click', (e) => {
  const btn = e.target.closest('.preset-btn');
  if (!btn) return;
  e.preventDefault();
  const dark = btn.getAttribute('data-dark');
  const light = btn.getAttribute('data-light');
  setColors(dark, light);
});

presetBadges?.addEventListener('mouseover', (e) => {
  const btn = e.target.closest('.preset-btn');
  if (!btn || !presetActiveName) return;
  const name = btn.getAttribute('data-name') || btn.getAttribute('title');
  if (name) presetActiveName.textContent = name;
});

presetBadges?.addEventListener('mouseout', (e) => {
  updatePresetActiveState();
});

// Direct listener fallback for all preset buttons
presetBtns.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const dark = btn.getAttribute('data-dark');
    const light = btn.getAttribute('data-light');
    setColors(dark, light);
  });
});

resetBtn?.addEventListener('click', (e) => {
  e.preventDefault();
  setColors('#3b2c2e', '#fcf5f2');
  if (sizeInput) sizeInput.value = '220';
});

form?.addEventListener('submit', (e) => {
  e.preventDefault();
  renderQRCode();
});

imageButton?.addEventListener('click', () => {
  if (imageInput?.files?.[0]) {
    handleImageSelect(imageInput.files[0]);
  } else {
    imageInput?.click();
  }
});

downloadBtn?.addEventListener('click', downloadQRCode);

document.addEventListener('DOMContentLoaded', () => {
  renderQRCode();
});
