/**
 * Smart Thai & international address text parser
 * Extracts Name, Phone, Province, District, Subdistrict, Zip Code, and Street Details
 */
export function parseThaiAddress(rawText) {
  if (!rawText || typeof rawText !== "string") {
    return {
      fullName: "",
      phoneNumber: "",
      province: "",
      district: "",
      subdistrict: "",
      zipCode: "",
      houseAndStreet: "",
    };
  }

  let text = rawText.trim();
  let phone = "";
  let zipCode = "";
  let province = "";
  let district = "";
  let subdistrict = "";
  let fullName = "";
  let houseAndStreet = "";

  // 1. Extract Phone Number
  // Matches: 0812345678, 081-234-5678, +66812345678, 02-123-4567
  const phoneRegex = /(?:(?:\+66|0)[689]\d{8}|0[2-57]\d{7}|(?:\+66|0)[\s-]?[0-9]{1,2}[\s-]?[0-9]{3,4}[\s-]?[0-9]{3,4})/;
  const phoneMatch = text.match(phoneRegex);
  if (phoneMatch) {
    phone = phoneMatch[0].replace(/[\s-]/g, "");
    if (phone.startsWith("+66")) {
      phone = "0" + phone.slice(3);
    }
    // Remove from text for further parsing
    text = text.replace(phoneMatch[0], " ");
  }

  // 2. Extract 5-digit Postal Code (10000 - 96000)
  const zipRegex = /\b[1-9]\d{4}\b/;
  const zipMatch = text.match(zipRegex);
  if (zipMatch) {
    zipCode = zipMatch[0];
    text = text.replace(zipRegex, " ");
  }

  // 3. Extract Province (จ. หรือ จังหวัด หรือ กรุงเทพมหานคร / กทม.)
  const provinceRegex = /(?:จ\.|จังหวัด)\s*([ก-๙a-zA-Z]+)|(?:^|\s)(กรุงเทพมหานคร|กรุงเทพฯ|กรุงเทพ|กทม\.?)(?:\s|$)/i;
  const provMatch = text.match(provinceRegex);
  if (provMatch) {
    province = (provMatch[1] || provMatch[2] || "").trim();
    if (/^(กรุงเทพ|กทม)/i.test(province)) {
      province = "กรุงเทพมหานคร";
    }
    text = text.replace(provMatch[0], " ");
  }

  // 4. Extract District / Amphoe / Khet (อ. หรือ อำเภอ หรือ เขต)
  const districtRegex = /(?:อ\.|อำเภอ|เขต)\s*([ก-๙a-zA-Z]+)/i;
  const distMatch = text.match(districtRegex);
  if (distMatch) {
    district = distMatch[1].trim();
    text = text.replace(distMatch[0], " ");
  }

  // 5. Extract Subdistrict / Tambon / Khwaeng (ต. หรือ ตำบล หรือ แขวง)
  const subdistrictRegex = /(?:ต\.|ตำบล|แขวง)\s*([ก-๙a-zA-Z]+)/i;
  const subMatch = text.match(subdistrictRegex);
  if (subMatch) {
    subdistrict = subMatch[1].trim();
    text = text.replace(subMatch[0], " ");
  }

  // Clean label artifacts
  text = text
    .replace(/(?:ชื่อ-นามสกุล|ชื่อ-สกุล|ชื่อผู้รับ|ชื่อ|นามสกุล|เบอร์โทรศัพท์|เบอร์โทร|เบอร์|โทร|ที่อยู่จัดส่ง|ที่อยู่|tel|phone|address)\s*[:：\-]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  // 6. Extract Recipient Name
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length > 1) {
    const firstLineClean = lines[0]
      .replace(/(?:ชื่อ-นามสกุล|ชื่อ-สกุล|ชื่อผู้รับ|ชื่อ|นามสกุล)\s*[:：\-]/gi, "")
      .trim();
    // If first line has no numbers, it's very likely the recipient name
    if (firstLineClean && !/\d/.test(firstLineClean)) {
      fullName = firstLineClean;
      text = text.replace(firstLineClean, " ").trim();
    }
  }

  if (!fullName) {
    // Look at leading text before house number or prefixes
    const nameMatch = text.match(/^([ก-๙a-zA-Z]+(?:\s+[ก-๙a-zA-Z]+)?)/);
    if (nameMatch && !/(?:บ้านเลขที่|เลขที่|หมู่|ซอย|ถนน|ถ\.|ซ\.|ต\.|อ\.|จ\.)/.test(nameMatch[0])) {
      fullName = nameMatch[0].trim();
      text = text.slice(nameMatch[0].length).trim();
    }
  }

  // 7. Clean up remaining text as House No. and Street details
  houseAndStreet = text
    .replace(/^[,\s\-]+|[,\s\-]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return {
    fullName,
    phoneNumber: phone,
    province,
    district,
    subdistrict,
    zipCode,
    houseAndStreet,
  };
}
