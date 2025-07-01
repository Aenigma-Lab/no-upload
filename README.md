# 🚫 no-upload

A **lightweight Chrome extension** that **blocks file uploads on all websites by default**, allowing uploads **only on whitelisted sites** with **password-protected settings and upload attempt history** for **secure, controlled browser environments**.

---

## ✨ Features

✅ Block file uploads globally across all websites  
✅ Allow uploads only on **whitelisted sites** you trust  
✅ **Password-protected settings panel** to prevent unauthorized changes  
✅ **Upload attempt history** to track when and where upload attempts occur  
✅ Lightweight and privacy-focused (no data sent externally)  
✅ Useful for **schools, parents, enterprises, and kiosk environments**

---

## 📦 Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/aenigma-lab/no-upload.git
    ```

## ⚙️ Usage

By default, all file upload fields (`<input type="file">`, drag-and-drop, etc.) are **blocked**.

To allow uploads:

- Open the **extension popup** or **options page**.
- Enter your **admin password**.
- Add trusted websites to the **whitelist**.
- View **upload attempt history** from the options page to monitor user activity.

---

## 🔒 Security & Privacy

- All **settings changes are password-protected**.
- Upload attempt logs are **stored locally only**.
- No tracking or external data collection.

---

## 🛠️ Tech Stack

- **JavaScript**
- **Chrome Extension APIs (Manifest V3)**
- **Local Storage** for secure config and logs


