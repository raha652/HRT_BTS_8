// 🔗 لینک اسکریپت Google Sheet (با doGet)
const SHEET_URL = "https://script.google.com/macros/s/AKfycbwXGFd3p2DFyy4TzwbGu0lBwGzJAsi7z9ZcO8wlFEu9b_mQwp9Sq0Jm0JxORjto70KSrQ/exec";

// 🔗 اطلاعات تلگرام
const BOT_TOKEN = "8249834114:AAE8N23oUkHLQmBemZ83CQD-fXgbLNAi7b4";
const CHAT_ID = "-1001867257289"; // آیدی گروه
const THREAD_ID = 14; // آیدی تاپیک

// لیست کاربران (می‌توانید این لیست را به دلخواه تغییر دهید)
const USERS = {
  "1806": "18",
  "1765": "1",
  "1807": "1",
  "1605": "nm",
  "1568": "tsh",
  "1613": "m@m",
  "1831": "sh",
  "1865": "hm",
  "1869": "mr",
  "1872": "qafori",
  "1892": "az",
  "1893": "sa",
  "1850": "nh",
  "1781": "zs",
  "1826": "rabbani",
  "user450": "us"
};



// فرم ورود
document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;
  if (USERS[username] && USERS[username] === password) {
    localStorage.setItem("technician_username", username);
    loginSuccess(username);
  } else {
    document.getElementById("loginStatus").textContent = "❌ نام کاربری یا رمز نادرست است.";
  }
});

function loginSuccess(username) {
  // مخفی کردن بخش ورود و نمایش محتوای اصلی
  document.getElementById("loginContainer").classList.add("hidden");
  document.getElementById("mainContent").classList.remove("hidden");


  // 🟢 تنظیم خودکار فیلد ID از نام کاربری و readonly کردن آن
  const idField = document.getElementById("employee_id");
  idField.value = username;
  idField.readOnly = true;
}



// گرفتن مقدار base از URL؛ اگر فیلد base هم در فرم نباشد، این مقدار از URL گرفته می‌شود
const urlParams = new URLSearchParams(window.location.search);
const base = urlParams.get("base") || "BTS_8";  // پیش‌فرض BTS_1

document.getElementById("formBtn").addEventListener("click", () => {
  document.getElementById("reportForm").classList.remove("hidden");
  document.getElementById("uploadForm").classList.add("hidden");
});

document.getElementById("uploadBtn").addEventListener("click", () => {
  document.getElementById("uploadForm").classList.remove("hidden");
  document.getElementById("reportForm").classList.add("hidden");
});

// رویداد ارسال فرم گزارش به Google Sheet
document.getElementById("reportForm").addEventListener("submit", function (e) {
  e.preventDefault();
  
  const params = new URLSearchParams({
    technician: document.getElementById("technician").value,
    technician_assistant: document.getElementById("technician_assistant").value,
    task: document.getElementById("task").value,
    activity: document.getElementById("activity").value,
    device_details: document.getElementById("device_details").value,
    date: document.getElementById("date").value,
    employee_id: document.getElementById("employee_id").value,
    base: base  // از URL گرفته می‌شود
  });
  
fetch(`${SHEET_URL}?${params.toString()}`)
  .then(res => res.text())
  .then(responseText => {
    document.getElementById("formStatus").textContent = "✅ " + responseText;
    this.reset();
    // 🟢 حفظ نام تکنسین و آیدی پس از ریست فرم
    const savedUsername = localStorage.getItem("technician_username");
    document.getElementById("technician").value = savedUsername;
    document.getElementById("employee_id").value = savedUsername;
    document.getElementById("employee_id").readOnly = true;
  })
  .catch(err => {
    console.error(err);
    document.getElementById("formStatus").textContent = "❌ خطا در ارسال.";
  });

});

// ارسال فایل به تلگرام
let xhr;
document.getElementById("uploadForm").addEventListener("submit", function (e) {
  e.preventDefault();
  
  const files = this.media.files;
  const caption = document.getElementById("caption").value;
  if (!files.length) return;

  const mediaGroup = [];
  const formData = new FormData();
  [...files].forEach((file, index) => {
    mediaGroup.push({
      type: file.type.startsWith("video/") ? "video" : "photo",
      media: `attach://${file.name}`,
      caption: index === 0 ? caption : undefined
    });
    formData.append(file.name, file);
  });
  
  formData.append("chat_id", CHAT_ID);
  formData.append("message_thread_id", THREAD_ID);
  formData.append("media", JSON.stringify(mediaGroup));
  
  document.getElementById("progressContainer").classList.remove("hidden");
  document.getElementById("cancelUploadBtn").classList.remove("hidden");
  const progressBar = document.getElementById("uploadProgress");
  const progressText = document.getElementById("progressText");
  
  xhr = new XMLHttpRequest();
  xhr.open("POST", `https://api.telegram.org/bot${BOT_TOKEN}/sendMediaGroup`, true);
  
  xhr.upload.onprogress = function (event) {
    if (event.lengthComputable) {
      const percent = Math.round((event.loaded / event.total) * 100);
      progressBar.value = percent;
      const sentMB = (event.loaded / 1024 / 1024).toFixed(1);
      const totalMB = (event.total / 1024 / 1024).toFixed(1);
      progressText.textContent = `📤 ارسال شده: ${sentMB} MB از ${totalMB} MB (${percent}%)`;
    }
  };
  
  xhr.onload = function () {
    if (xhr.status === 200) {
      document.getElementById("uploadStatus").textContent = "✅ فایل‌ها موفقانه ارسال شدند.";
    } else {
      document.getElementById("uploadStatus").textContent = "❌ خطا در ارسال فایل‌ها.";
    }
    resetProgressUI();
  };
  
  xhr.onerror = function () {
    document.getElementById("uploadStatus").textContent = "❌ خطا در ارتباط.";
    resetProgressUI();
  };
  
  xhr.send(formData);
});

document.getElementById("cancelUploadBtn").addEventListener("click", function () {
  if (xhr) {
    xhr.abort();
    document.getElementById("uploadStatus").textContent = "⛔ ارسال فایل‌ها لغو شد.";
    resetProgressUI();
  }
});

function resetProgressUI() {
  document.getElementById("uploadForm").reset();
  document.getElementById("progressContainer").classList.add("hidden");
  document.getElementById("cancelUploadBtn").classList.add("hidden");
  document.getElementById("uploadProgress").value = 0;
  document.getElementById("progressText").textContent = "";
}




