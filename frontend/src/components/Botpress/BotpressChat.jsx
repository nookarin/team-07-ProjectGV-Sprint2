import { useEffect } from 'react';

const BotpressChat = () => {
  useEffect(() => {
    // 1. โหลด inject.js
    const script1 = document.createElement('script');
    script1.src = "https://cdn.botpress.cloud/webchat/v5.0/inject.js";
    script1.async = true;

    // 2. โหลด config.js (เปลี่ยน YOUR_BOT_ID เป็น ID บอทของคุณ)
    const script2 = document.createElement('script');
    script2.src = "https://files.bpcontent.cloud/2026/09/18/07/20260918075524-J5WU53VZ.js";
    script2.async = true;

    // ต่อสคริปต์เข้าไปใน <body>
    document.body.appendChild(script1);
    document.body.appendChild(script2);

    // ทำความสะอาดสคริปต์เมื่อ Component ถูก Unmount
    return () => {
      document.body.removeChild(script1);
      document.body.removeChild(script2);
    };
  }, []);

  return null; // คอมโพเนนต์นี้ไม่ต้องแสดงผล UI เพิ่มเติม เพราะ Botpress จะสร้าง Widget ลอยขึ้นมาเอง
};

export default BotpressChat;