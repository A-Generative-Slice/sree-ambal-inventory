/**
 * ============================================================================
 * SREE AMBAL CATERING — MULTILINGUAL TRANSLATION ENGINE (i18n.js)
 * Supporting: English (EN), Tamil (TA), Malayalam (ML), Hindi (HI), Telugu (TE)
 * ============================================================================
 */

const I18N_DICTIONARY = {
  en: {
    appTitle: "Sree Ambal Catering",
    appSubtitle: "Minimal Multilingual Portal",
    selectLang: "Language / மொழி / ഭാഷ / भाषा / భాష",
    statusConnected: "Live Connected",
    statusOffline: "Offline Mode",
    statusSyncing: "Syncing...",
    
    // Login Portal
    loginTitle: "Portal Access Login",
    loginSubtitle: "Select your role to access the Sree Ambal ledger",
    roleStaff: "Inventory Manager (Ground Staff)",
    roleAdmin: "Administrator Dashboard",
    staffNamePlaceholder: "Enter Your Name / ID (e.g., Ramesh - Chef)",
    adminPinPlaceholder: "Enter Admin PIN (Default: 1234)",
    loginBtn: "Access Portal",
    loginErrorPin: "Invalid Admin PIN. Default is 1234.",
    loginErrorName: "Please enter your Staff Name or ID.",

    // Staff Ground View
    staffHeader: "Ground Stock Ledger",
    zeroKeyboardBadge: "Quick-Touch Mode",
    currentBalance: "CURRENT BALANCE",
    kgUnit: "kg",
    itemSugar: "Sugar",
    itemRice: "Rice",
    itemLogistics: "Logistics Containers",
    itemOther: "Other Ledger Item",
    newLedgerEntry: "New Ledger Entry",
    idPrefix: "ID: #",
    
    // Confirm & Bill Capture Modal
    modalTitle: "Verify Stock Movement",
    modalSubtitle: "Security Audit & Bill Capture",
    modalItemLabel: "Item Name:",
    modalChangeLabel: "Stock Adjustment:",
    modalNewBalanceLabel: "New Balance:",
    modalBillLabel: "Attach Bill / Permission Paper Reference:",
    modalBillPlaceholder: "e.g., BILL-4092 or Gate Pass #88",
    modalCaptureBtn: "📷 Capture Bill Photo",
    modalPhotoAttached: "✅ Bill Photo Captured",
    modalConfirmBtn: "Confirm & Update Database",
    modalCancelBtn: "Cancel",

    // Admin Dashboard
    adminHeader: "Administrator Control Panel",
    tabAudit: "Security Audit Trail & Bills",
    tabStaff: "Staff Account Management",
    auditEmpty: "No stock movement transactions logged yet.",
    colTime: "Timestamp",
    colStaff: "Updated By",
    colItem: "Item",
    colChange: "Change",
    colBalance: "New Balance",
    colBill: "Bill Verification / Reference",
    viewPhotoBtn: "🖼️ View Attached Bill",
    staffEmpty: "No staff managers registered yet.",
    colName: "Staff Name / ID",
    colStatus: "Status",
    colActions: "Actions",
    statusApproved: "Approved",
    statusPending: "Pending Verification",
    btnApprove: "Approve",
    btnRevoke: "Revoke",
    btnDelete: "Delete",

    // General & Toasts
    switchRoleBtn: "👤 Switch Role",
    refreshBtnTitle: "Refresh Live Database",
    toastUpdated: "Stock updated successfully live in Supabase!",
    toastOfflineUpdate: "Saved offline. Will sync when Wi-Fi connects.",
    toastError: "Database update error: ",

    // v2: Search & Catalog
    searchPlaceholder: "Search 200+ items in any language...",
    reqNewItemBtn: "➕ Request New Item / Category",
    catAll: "All (200+)",
    catGrains: "🌾 Grains & Pulses",
    catSpices: "🌶️ Spices & Masalas",
    catOils: "🛢️ Oils & Ghee",
    catSweeteners: "🍯 Sweeteners & Acidulants",
    catPerishables: "🥬 Vegetables & Perishables",
    catDairy: "🥛 Dairy & Provisions",
    catNuts: "🥜 Nuts & Dry Fruits",
    catUtensils: "🥘 Utensils & Equipment",

    // v2: Cart & Batch Processing
    openCartBtn: "Batch Cart",
    cartTitle: "Inventory Batch Cart",
    txTypeLabel: "Select Batch Transaction Type:",
    securityHeading: "Security Verification (Mandatory)",
    securityNote: "You must capture and attach a physical bill receipt or gate pass photo to unlock submission.",
    billRefPlaceholder: "Enter Bill / Gate Pass / Challan No. *",
    capturePhotoBtn: "Capture Bill / Permission Photo *",
    photoAttachedText: "Verified Receipt Attached",
    attachPhotoUnlockText: "Attach Photo & Bill No. to Unlock",

    // v2: Registration & Approval
    noAccountText: "New staff member?",
    registerLink: "📝 Create Staff Account",
    regModalTitle: "Create Staff Account",
    regModalSub: "Submit your details for Administrator approval",
    regUsernameLabel: "Username / Staff ID *",
    regEmailLabel: "Email / Phone Number *",
    regPasswordLabel: "Password *",
    submitRegBtn: "Register Account",
    pendingTitle: "Account Waiting for Approval",
    pendingDesc: "Your staff account has been registered and is currently queued for administrator review.",
    checkStatusBtn: "🔄 Check Approval Status",
    returnLoginBtn: "🚪 Return to Login",

    // v2: Custom Item Request
    customModalTitle: "Request New Item / Category",
    customModalSub: "Submit for Admin approval and catalog inclusion",
    customNameLabel: "Item or Category Name *",
    customUnitLabel: "Default Measurement Unit *",
    submitReqBtn: "Submit Request",

    // v2: Admin Tabs & Analytics
    tabAudit: "Security Audit Trail & Bills",
    tabAnalytics: "📊 Category Analytics",
    tabApprovals: "Pending Approvals",
    tabStaff: "Staff Accounts",
    colType: "Type",
    colItemSummary: "Batch Items Summary",
    colEmail: "Email",
    colRegTime: "Registered At",
    colUsername: "Username / ID",
    colReqBy: "Requested By",
    colItemName: "Item / Category Name",
    colUnit: "Unit",
    noPendingAccounts: "No pending user account registrations.",
    noPendingItems: "No custom item requests waiting.",
    analyticsTitle: "Current Stock Distribution by Category",
    analyticsSub: "Live volume metrics across 8 South Indian catering categories",
    exportLedgerBtn: "Export Ledger (CSV)",
    exportLogsBtn: "Export Logs (CSV)"
  },

  ta: {
    appTitle: "ஸ்ரீ அம்பாள் கேடரிங்",
    appSubtitle: "பல்மொழி சரக்கு போர்ட்டல்",
    selectLang: "மொழி / Language",
    statusConnected: "நேரடி இணைப்பு",
    statusOffline: "ஆஃப்லைன் முறை",
    statusSyncing: "ஒத்திசைக்கிறது...",
    
    loginTitle: "போர்ட்டல் நுழைவு",
    loginSubtitle: "உங்கள் பதவியைத் தேர்ந்தெடுத்து உள்நுழையவும்",
    roleStaff: "சரக்கு மேலாளர் (களப் பணியாளர்)",
    roleAdmin: "நிர்வாகி (Admin)",
    staffNamePlaceholder: "உங்கள் பெயர் / ஐடி (எ.கா: ரமேஷ்)",
    adminPinPlaceholder: "நிர்வாகி பின் (Default: 1234)",
    loginBtn: "உள்நுழையவும்",
    loginErrorPin: "தவறான பின் எண். (Default: 1234)",
    loginErrorName: "தயவுசெய்து உங்கள் பெயரை உள்ளிடவும்.",

    staffHeader: "களச் சரக்கு இருப்பு",
    zeroKeyboardBadge: "விரைவு தொடு முறை",
    currentBalance: "தற்போதைய இருப்பு",
    kgUnit: "கிலோ",
    itemSugar: "சர்க்கரை",
    itemRice: "அரிசி",
    itemLogistics: "கொள்கலன்கள் (Containers)",
    itemOther: "மற்ற சரக்கு",
    newLedgerEntry: "புதிய பதிவு",
    idPrefix: "எண்: #",
    
    modalTitle: "சரக்கு மாற்றத்தை உறுதிப்படுத்தவும்",
    modalSubtitle: "பாதுகாப்பு மற்றும் ரசீது சரிபார்ப்பு",
    modalItemLabel: "பொருள்:",
    modalChangeLabel: "மாற்றம்:",
    modalNewBalanceLabel: "புதிய இருப்பு:",
    modalBillLabel: "ரசீது / அனுமதி சீட்டு எண்:",
    modalBillPlaceholder: "எ.கா: BILL-4092 அல்லது Gate Pass",
    modalCaptureBtn: "📷 ரசீதை புகைப்படம் எடுக்கவும்",
    modalPhotoAttached: "✅ புகைப்படம் இணைக்கப்பட்டது",
    modalConfirmBtn: "உறுதி செய் & புதுப்பி",
    modalCancelBtn: "ரத்து செய்",

    adminHeader: "நிர்வாகி கட்டுப்பாட்டு அறை",
    tabAudit: "பாதுகாப்பு தணிக்கை & ரசீதுகள்",
    tabStaff: "பணியாளர் கணக்கு மேலாண்மை",
    auditEmpty: "இதுவரை எந்த பரிவர்த்தனையும் பதிவு செய்யப்படவில்லை.",
    colTime: "நேரம்",
    colStaff: "புதுப்பித்தவர்",
    colItem: "பொருள்",
    colChange: "மாற்றம்",
    colBalance: "இருப்பு",
    colBill: "ரசீது சரிபார்ப்பு",
    viewPhotoBtn: "🖼️ ரசீதைப் பார்க்க",
    staffEmpty: "பணியாளர்கள் யாரும் பதிவு செய்யவில்லை.",
    colName: "பணியாளர் பெயர்",
    colStatus: "நிலை",
    colActions: "செயல்கள்",
    statusApproved: "அங்கீகரிக்கப்பட்டது",
    statusPending: "சரிபார்ப்பில் உள்ளது",
    btnApprove: "அங்கீகரி",
    btnRevoke: "ரத்து செய்",
    btnDelete: "நீக்கு",

    switchRoleBtn: "👤 கணக்கு மாற்று",
    refreshBtnTitle: "தரவை புதுப்பி",
    toastUpdated: "சரக்கு இருப்பு வெற்றிகரமாக புதுப்பிக்கப்பட்டது!",
    toastOfflineUpdate: "ஆஃப்லைனில் சேமிக்கப்பட்டது. இணையம் வந்ததும் ஒத்திசைக்கப்படும்.",
    toastError: "பிழை: ",
    searchPlaceholder: "200+ பொருட்களை தேடுங்கள்...",
    reqNewItemBtn: "➕ புதிய பொருள் கோரிக்கை",
    catAll: "அனைத்தும் (200+)", catGrains: "🌾 தானியங்கள்", catSpices: "🌶️ மசாலா", catOils: "🛢️ எண்ணெய்", catSweeteners: "🍯 இனிப்பு", catPerishables: "🥬 காய்கறிகள்", catDairy: "🥛 பால்", catNuts: "🥜 பருப்பு", catUtensils: "🥘 பாத்திரங்கள்",
    openCartBtn: "தொகுப்பு வண்டி", cartTitle: "சரக்கு தொகுப்பு வண்டி", txTypeLabel: "பரிவர்த்தனை வகை:", securityHeading: "பாதுகாப்பு சரிபார்ப்பு (கட்டாயம்)", securityNote: "ரசீது புகைப்படம் இணைக்கவும்.", billRefPlaceholder: "பில் / கேட் பாஸ் எண் *", capturePhotoBtn: "📷 ரசீது புகைப்படம் *", photoAttachedText: "ரசீது இணைக்கப்பட்டது", attachPhotoUnlockText: "புகைப்படம் இணைத்து திறக்கவும்",
    noAccountText: "புதிய பணியாளரா?", registerLink: "📝 கணக்கு உருவாக்கு", regModalTitle: "பணியாளர் கணக்கு உருவாக்கம்", regModalSub: "நிர்வாகி ஒப்புதலுக்கு சமர்ப்பிக்கவும்", regUsernameLabel: "பயனர்பெயர் *", regEmailLabel: "மின்னஞ்சல் / தொலைபேசி *", regPasswordLabel: "கடவுச்சொல் *", submitRegBtn: "பதிவு செய்", pendingTitle: "ஒப்புதலுக்காக காத்திருக்கிறது", pendingDesc: "உங்கள் கணக்கு நிர்வாகி மதிப்பாய்வுக்கு காத்திருக்கிறது.", checkStatusBtn: "🔄 நிலையை சரிபார்", returnLoginBtn: "🚪 உள்நுழைவுக்கு திரும்பு",
    customModalTitle: "புதிய பொருள் கோரிக்கை", customModalSub: "நிர்வாகி ஒப்புதலுக்கு", customNameLabel: "பொருள் பெயர் *", customUnitLabel: "அளவீட்டு அலகு *", submitReqBtn: "கோரிக்கை சமர்ப்பி",
    tabAnalytics: "📊 பகுப்பாய்வு", tabApprovals: "ஒப்புதல்கள்", colType: "வகை", colItemSummary: "தொகுப்பு சுருக்கம்", colEmail: "மின்னஞ்சல்", colRegTime: "பதிவு நேரம்", colUsername: "பயனர்பெயர்", colReqBy: "கோரியவர்", colItemName: "பொருள் பெயர்", colUnit: "அலகு", noPendingAccounts: "நிலுவையில் கணக்குகள் இல்லை.", noPendingItems: "நிலுவையில் கோரிக்கைகள் இல்லை.", analyticsTitle: "வகைவாரி சரக்கு விநியோகம்", analyticsSub: "8 வகைகளில் நேரடி அளவீடுகள்", exportLedgerBtn: "சரக்கு ஏற்றுமதி (CSV)", exportLogsBtn: "பதிவுகள் ஏற்றுமதி (CSV)"
  },

  ml: {
    appTitle: "ശ്രീ അംബാൾ കേറ്ററിംഗ്",
    appSubtitle: "മൾട്ടിലിംഗ്വൽ ഇൻവെന്ററി പോർട്ടൽ",
    selectLang: "ഭാഷ / Language",
    statusConnected: "ലൈവ് കണക്റ്റഡ്",
    statusOffline: "ഓഫ്‌ലൈൻ മോഡ്",
    statusSyncing: "സിങ്ക് ചെയ്യുന്നു...",
    
    loginTitle: "പോർട്ടൽ ലോഗിൻ",
    loginSubtitle: "നിങ്ങളുടെ റോൾ തിരഞ്ഞെടുക്കുക",
    roleStaff: "ഇൻവെന്ററി മാനേജർ (ഗ്രൗണ്ട് സ്റ്റാഫ്)",
    roleAdmin: "അഡ്മിനിസ്ട്രേറ്റർ",
    staffNamePlaceholder: "പേര് / ID നൽകുക (ഉദാ: രമേഷ്)",
    adminPinPlaceholder: "അഡ്മിൻ PIN (Default: 1234)",
    loginBtn: "പ്രവേശിക്കുക",
    loginErrorPin: "തെറ്റായ PIN (Default: 1234)",
    loginErrorName: "ദയവായി നിങ്ങളുടെ പേര് നൽകുക.",

    staffHeader: "സ്റ്റോക്ക് ലെഡ്ജർ",
    zeroKeyboardBadge: "ക്വിക്ക് ടച്ച് മോഡ്",
    currentBalance: "നിലവിലെ ബാലൻസ്",
    kgUnit: "kg",
    itemSugar: "പഞ്ചസാര",
    itemRice: "അരി",
    itemLogistics: "കണ്ടെയ്നറുകൾ",
    itemOther: "മറ്റു സാധനങ്ങൾ",
    newLedgerEntry: "പുതിയ എൻട്രി",
    idPrefix: "നമ്പർ: #",
    
    modalTitle: "സ്റ്റോക്ക് മാറ്റം സ്ഥിരീകരിക്കുക",
    modalSubtitle: "ബില്ലും ഫോട്ടോ പരിശോധനയും",
    modalItemLabel: "സാധനം:",
    modalChangeLabel: "മാറ്റം:",
    modalNewBalanceLabel: "പുതിയ ബാലൻസ്:",
    modalBillLabel: "ബിൽ / പെർമിഷൻ പേപ്പർ നമ്പർ:",
    modalBillPlaceholder: "ഉദാ: BILL-4092",
    modalCaptureBtn: "📷 ബിൽ ഫോട്ടോ എടുക്കുക",
    modalPhotoAttached: "✅ ഫോട്ടോ അറ്റാച്ചുചെയ്തു",
    modalConfirmBtn: "സ്ഥിരീകരിക്കുക & അപ്ഡേറ്റ് ചെയ്യുക",
    modalCancelBtn: "റദ്ദാക്കുക",

    adminHeader: "അഡ്മിൻ കൺട്രോൾ പാനൽ",
    tabAudit: "ഓഡിറ്റ് ട്രെയിലും ബില്ലുകളും",
    tabStaff: "സ്റ്റാഫ് അക്കൗണ്ട് മാനേജ്മെന്റ്",
    auditEmpty: "ഇതുവരെ ഇടപാടുകളൊന്നും രേഖപ്പെടുത്തിയിട്ടില്ല.",
    colTime: "സമയം",
    colStaff: "അപ്ഡേറ്റ് ചെയ്തത്",
    colItem: "സാധനം",
    colChange: "മാറ്റം",
    colBalance: "ബാലൻസ്",
    colBill: "ബിൽ പരിശോധന",
    viewPhotoBtn: "🖼️ ബിൽ കാണുക",
    staffEmpty: "സ്റ്റാഫുകളൊന്നും രജിസ്റ്റർ ചെയ്തിട്ടില്ല.",
    colName: "സ്റ്റാഫ് പേര്",
    colStatus: "സ്റ്റാറ്റസ്",
    colActions: "പ്രവർത്തനങ്ങൾ",
    statusApproved: "അംഗീകരിച്ചു",
    statusPending: "പെൻഡിംഗ്",
    btnApprove: "അംഗീകരിക്കുക",
    btnRevoke: "റദ്ദാക്കുക",
    btnDelete: "നീക്കം ചെയ്യുക",

    switchRoleBtn: "👤 ലോഗൗട്ട് / റോൾ മാറ്റുക",
    refreshBtnTitle: "റിഫ്രഷ് ചെയ്യുക",
    toastUpdated: "സ്റ്റോക്ക് വിജയകരമായി അപ്ഡേറ്റ് ചെയ്തു!",
    toastOfflineUpdate: "ഓഫ്‌ലൈനായി സേവ് ചെയ്തു.",
    toastError: "എറർ: ",
    searchPlaceholder: "200+ സാധനങ്ങൾ തിരയുക...", reqNewItemBtn: "➕ പുതിയ സാധനം", catAll: "എല്ലാം (200+)", catGrains: "🌾 ധാന്യങ്ങൾ", catSpices: "🌶️ മസാല", catOils: "🛢️ എണ്ണ", catSweeteners: "🍯 മധുരം", catPerishables: "🥬 പച്ചക്കറി", catDairy: "🥛 പാൽ", catNuts: "🥜 നട്ട്സ്", catUtensils: "🥘 പാത്രങ്ങൾ",
    openCartBtn: "ബാച്ച് കാർട്ട്", cartTitle: "ഇൻവെന്ററി ബാച്ച് കാർട്ട്", txTypeLabel: "ഇടപാട് തരം:", securityHeading: "സുരക്ഷാ പരിശോധന", securityNote: "ബിൽ ഫോട്ടോ അറ്റാച്ച് ചെയ്യുക.", billRefPlaceholder: "ബിൽ / ഗേറ്റ് പാസ് നമ്പർ *", capturePhotoBtn: "📷 ബിൽ ഫോട്ടോ *", photoAttachedText: "ഫോട്ടോ അറ്റാച്ച്ഡ്", attachPhotoUnlockText: "അൺലോക്ക് ചെയ്യാൻ ഫോട്ടോ ചേർക്കുക",
    noAccountText: "പുതിയ സ്റ്റാഫ്?", registerLink: "📝 അക്കൗണ്ട് ഉണ്ടാക്കുക", regModalTitle: "സ്റ്റാഫ് അക്കൗണ്ട്", regModalSub: "അഡ്മിൻ അംഗീകാരത്തിനായി", regUsernameLabel: "പേര് *", regEmailLabel: "ഇമെയിൽ *", regPasswordLabel: "പാസ്‌വേഡ് *", submitRegBtn: "രജിസ്റ്റർ", pendingTitle: "അംഗീകാരത്തിനായി കാത്തിരിക്കുന്നു", pendingDesc: "നിങ്ങളുടെ അക്കൗണ്ട് അഡ്മിൻ അവലോകനത്തിനായി കാത്തിരിക്കുന്നു.", checkStatusBtn: "🔄 സ്റ്റാറ്റസ് പരിശോധിക്കുക", returnLoginBtn: "🚪 ലോഗിനിലേക്ക്",
    customModalTitle: "പുതിയ സാധനം", customModalSub: "അഡ്മിൻ അംഗീകാരത്തിനായി", customNameLabel: "സാധനത്തിന്റെ പേര് *", customUnitLabel: "യൂണിറ്റ് *", submitReqBtn: "സമർപ്പിക്കുക",
    tabAnalytics: "📊 അനലിറ്റിക്സ്", tabApprovals: "അംഗീകാരങ്ങൾ", colType: "തരം", colItemSummary: "സംഗ്രഹം", colEmail: "ഇമെയിൽ", colRegTime: "രജിസ്ട്രേഷൻ", colUsername: "പേര്", colReqBy: "അഭ്യർത്ഥിച്ചത്", colItemName: "സാധനം", colUnit: "യൂണിറ്റ്", noPendingAccounts: "പെൻഡിംഗ് അക്കൗണ്ടുകൾ ഇല്ല.", noPendingItems: "പെൻഡിംഗ് അഭ്യർത്ഥനകൾ ഇല്ല.", analyticsTitle: "വിഭാഗം അനുസരിച്ച് സ്റ്റോക്ക്", analyticsSub: "8 വിഭാഗങ്ങളിലെ ലൈവ് മെട്രിക്സ്", exportLedgerBtn: "ലെഡ്ജർ (CSV)", exportLogsBtn: "ലോഗുകൾ (CSV)"
  },

  hi: {
    appTitle: "श्री अम्बाळ कैटरिंग",
    appSubtitle: "बहुभाषी इन्वेंटरी पोर्टल",
    selectLang: "भाषा / Language",
    statusConnected: "लाइव कनेक्टेड",
    statusOffline: "ऑफ़लाइन मोड",
    statusSyncing: "सिंक हो रहा है...",
    
    loginTitle: "पोर्टल लॉगिन",
    loginSubtitle: "खाता चुनने के लिए अपनी भूमिका चुनें",
    roleStaff: "इन्वेंटरी मैनेजर (ग्राउंड स्टाफ)",
    roleAdmin: "प्रशासक (Admin)",
    staffNamePlaceholder: "अपना नाम / आईडी दर्ज करें (जैसे: रमेश)",
    adminPinPlaceholder: "एडमिन पिन (Default: 1234)",
    loginBtn: "लॉगिन करें",
    loginErrorPin: "गलत पिन। (Default: 1234)",
    loginErrorName: "कृपया अपना नाम दर्ज करें।",

    staffHeader: "ग्राउंड स्टॉक लेजर",
    zeroKeyboardBadge: "क्विक टच मोड",
    currentBalance: "वर्तमान शेष",
    kgUnit: "किग्रा",
    itemSugar: "चीनी",
    itemRice: "चावल",
    itemLogistics: "लॉजिस्टिक्स कंटेनर",
    itemOther: "अन्य आइटम",
    newLedgerEntry: "नई प्रविष्टि",
    idPrefix: "आईडी: #",
    
    modalTitle: "स्टॉक अपडेट की पुष्टि करें",
    modalSubtitle: "सुरक्षा जांच और बिल सत्यापन",
    modalItemLabel: "आइटम का नाम:",
    modalChangeLabel: "स्टॉक परिवर्तन:",
    modalNewBalanceLabel: "नया शेष:",
    modalBillLabel: "बिल / अनुमति पर्ची नंबर:",
    modalBillPlaceholder: "जैसे: BILL-4092 या Gate Pass",
    modalCaptureBtn: "📷 बिल की फोटो लें",
    modalPhotoAttached: "✅ फोटो संलग्न किया गया",
    modalConfirmBtn: "पुष्टि करें और डेटाबेस अपडेट करें",
    modalCancelBtn: "रद्द करें",

    adminHeader: "एडमिन कंट्रोल पैनल",
    tabAudit: "सुरक्षा ऑडिट और बिल",
    tabStaff: "स्टाफ प्रबंधन",
    auditEmpty: "अभी तक कोई लेनदेन दर्ज नहीं किया गया है।",
    colTime: "समय",
    colStaff: "अपडेटकर्ता",
    colItem: "आइटम",
    colChange: "परिवर्तन",
    colBalance: "नया शेष",
    colBill: "बिल सत्यापन / संदर्भ",
    viewPhotoBtn: "🖼️ बिल फोटो देखें",
    staffEmpty: "कोई स्टाफ पंजीकृत नहीं है।",
    colName: "स्टाफ का नाम",
    colStatus: "स्थिति",
    colActions: "कार्रवाई",
    statusApproved: "स्वीकृत",
    statusPending: "लंबित (Pending)",
    btnApprove: "स्वीकार करें",
    btnRevoke: "रद्द करें",
    btnDelete: "हटाएं",

    switchRoleBtn: "👤 भूमिका बदलें",
    refreshBtnTitle: "डेटा रीफ्रेश करें",
    toastUpdated: "स्टॉक सफलतापूर्वक अपडेट किया गया!",
    toastOfflineUpdate: "ऑफ़लाइन सहेजा गया। इंटरनेट आने पर सिंक होगा।",
    toastError: "डेटाबेस त्रुटि: ",
    searchPlaceholder: "200+ आइटम खोजें...", reqNewItemBtn: "➕ नया आइटम", catAll: "सभी (200+)", catGrains: "🌾 अनाज", catSpices: "🌶️ मसाले", catOils: "🛢️ तेल", catSweeteners: "🍯 मीठा", catPerishables: "🥬 सब्जी", catDairy: "🥛 दूध", catNuts: "🥜 मेवे", catUtensils: "🥘 बर्तन",
    openCartBtn: "बैच कार्ट", cartTitle: "इन्वेंटरी बैच कार्ट", txTypeLabel: "लेनदेन प्रकार:", securityHeading: "सुरक्षा सत्यापन", securityNote: "बिल फोटो संलग्न करें.", billRefPlaceholder: "बिल / गेट पास नं. *", capturePhotoBtn: "📷 बिल फोटो *", photoAttachedText: "फोटो संलग्न", attachPhotoUnlockText: "अनलॉक करने के लिए फोटो जोड़ें",
    noAccountText: "नए स्टाफ?", registerLink: "📝 खाता बनाएं", regModalTitle: "स्टाफ खाता", regModalSub: "एडमिन अनुमोदन के लिए", regUsernameLabel: "नाम *", regEmailLabel: "ईमेल *", regPasswordLabel: "पासवर्ड *", submitRegBtn: "पंजीकरण", pendingTitle: "अनुमोदन की प्रतीक्षा", pendingDesc: "आपका खाता समीक्षा के लिए कतार में है.", checkStatusBtn: "🔄 स्थिति जांचें", returnLoginBtn: "🚪 वापस लॉगिन",
    customModalTitle: "नया आइटम", customModalSub: "एडमिन अनुमोदन", customNameLabel: "आइटम नाम *", customUnitLabel: "इकाई *", submitReqBtn: "अनुरोध भेजें",
    tabAnalytics: "📊 एनालिटिक्स", tabApprovals: "अनुमोदन", colType: "प्रकार", colItemSummary: "सारांश", colEmail: "ईमेल", colRegTime: "पंजीकरण", colUsername: "नाम", colReqBy: "अनुरोधकर्ता", colItemName: "आइटम", colUnit: "इकाई", noPendingAccounts: "कोई लंबित खाते नहीं.", noPendingItems: "कोई लंबित अनुरोध नहीं.", analyticsTitle: "श्रेणी अनुसार स्टॉक", analyticsSub: "8 श्रेणियों में लाइव मेट्रिक्स", exportLedgerBtn: "लेजर (CSV)", exportLogsBtn: "लॉग (CSV)"
  },

  te: {
    appTitle: "శ్రీ అంబాల్ కేటరింగ్",
    appSubtitle: "బహుభాషా ఇన్వెంటరీ పోర్టల్",
    selectLang: "భాష / Language",
    statusConnected: "లైవ్ కనెక్టెడ్",
    statusOffline: "ఆఫ్‌లైన్ మోడ్",
    statusSyncing: "సింక్ అవుతోంది...",
    
    loginTitle: "పోర్టల్ లాగిన్",
    loginSubtitle: "యాక్సెస్ కోసం మీ పాత్రను ఎంచుకోండి",
    roleStaff: "ఇన్వెంటరీ మేనేజర్ (గ్రౌండ్ స్టాఫ్)",
    roleAdmin: "అడ్మినిస్ట్రేటర్ (Admin)",
    staffNamePlaceholder: "మీ పేరు / ID (ఉదా: రమేష్)",
    adminPinPlaceholder: "అడ్మిన్ పిన్ (Default: 1234)",
    loginBtn: "లాగిన్ చేయండి",
    loginErrorPin: "తప్పు పిన్ (Default: 1234)",
    loginErrorName: "దయచేసి మీ పేరును నమోదు చేయండి.",

    staffHeader: "గ్రౌండ్ స్టాక్ లెడ్జర్",
    zeroKeyboardBadge: "క్విక్ టచ్ మోడ్",
    currentBalance: "ప్రస్తుత నిల్వ",
    kgUnit: "కిలోలు",
    itemSugar: "చక్కెర",
    itemRice: "బియ్యం",
    itemLogistics: "లాజిస్టిక్స్ కంటైనర్లు",
    itemOther: "ఇతర వస్తువు",
    newLedgerEntry: "కొత్త ఎంట్రీ",
    idPrefix: "ID: #",
    
    modalTitle: "స్టాక్ మార్పును నిర్ధారించండి",
    modalSubtitle: "సెక్యూరిటీ ఆడిట్ & బిల్లు ఫోటో",
    modalItemLabel: "వస్తువు పేరు:",
    modalChangeLabel: "మార్పు:",
    modalNewBalanceLabel: "కొత్త నిల్వ:",
    modalBillLabel: "బిల్లు / పర్మిషన్ పేపర్ నంబర్:",
    modalBillPlaceholder: "ఉదా: BILL-4092",
    modalCaptureBtn: "📷 బిల్లు ఫోటో తీయండి",
    modalPhotoAttached: "✅ ఫోటో జతచేయబడింది",
    modalConfirmBtn: "నిర్ధారించండి & అప్‌డేట్ చేయండి",
    modalCancelBtn: "రద్దు చేయండి",

    adminHeader: "అడ్మిన్ కంట్రోల్ ప్యానెల్",
    tabAudit: "సెక్యూరిటీ ఆడిట్ & బిల్లులు",
    tabStaff: "స్టాఫ్ మేనేజ్‌మెంట్",
    auditEmpty: "ఇంకా ఎలాంటి లావాదేవీలు నమోదు కాలేదు.",
    colTime: "సమయం",
    colStaff: "అప్‌డేట్ చేసినవారు",
    colItem: "వస్తువు",
    colChange: "మార్పు",
    colBalance: "నిల్వ",
    colBill: "బిల్లు నిర్ధారణ",
    viewPhotoBtn: "🖼️ బిల్లు చూడండి",
    staffEmpty: "ఎవరు నమోదు కాలేదు.",
    colName: "స్టాఫ్ పేరు",
    colStatus: "స్థితి",
    colActions: "చర్యలు",
    statusApproved: "ఆమోదించబడింది",
    statusPending: "పెండింగ్",
    btnApprove: "ఆమోదించు",
    btnRevoke: "రద్దు చేయి",
    btnDelete: "తొలగించు",

    switchRoleBtn: "👤 పాత్రను మార్చు",
    refreshBtnTitle: "డేటా రిఫ్రెష్",
    toastUpdated: "స్టాక్ విజయవంతంగా అప్‌డేట్ చేయబడింది!",
    toastOfflineUpdate: "ఆఫ్‌లైన్‌లో సేవ్ చేయబడింది.",
    toastError: "ఎర్రర్: ",
    searchPlaceholder: "200+ వస్తువులు వెతకండి...", reqNewItemBtn: "➕ కొత్త వస్తువు", catAll: "అన్నీ (200+)", catGrains: "🌾 ధాన్యాలు", catSpices: "🌶️ మసాలాలు", catOils: "🛢️ నూనెలు", catSweeteners: "🍯 తీపి", catPerishables: "🥬 కూరగాయలు", catDairy: "🥛 పాలు", catNuts: "🥜 డ్రై ఫ్రూట్స్", catUtensils: "🥘 పాత్రలు",
    openCartBtn: "బ్యాచ్ కార్ట్", cartTitle: "ఇన్వెంటరీ బ్యాచ్ కార్ట్", txTypeLabel: "లావాదేవీ రకం:", securityHeading: "భద్రతా ధ్రువీకరణ", securityNote: "బిల్లు ఫోటో జత చేయండి.", billRefPlaceholder: "బిల్లు / గేట్ పాస్ నం. *", capturePhotoBtn: "📷 బిల్లు ఫోటో *", photoAttachedText: "ఫోటో జతచేయబడింది", attachPhotoUnlockText: "అన్‌లాక్ చేయడానికి ఫోటో జత చేయండి",
    noAccountText: "కొత్త స్టాఫ్?", registerLink: "📝 ఖాతా సృష్టించు", regModalTitle: "స్టాఫ్ ఖాతా", regModalSub: "అడ్మిన్ ఆమోదం కోసం", regUsernameLabel: "పేరు *", regEmailLabel: "ఇమెయిల్ *", regPasswordLabel: "పాస్‌వర్డ్ *", submitRegBtn: "నమోదు", pendingTitle: "ఆమోదం కోసం వేచి ఉంది", pendingDesc: "మీ ఖాతా అడ్మిన్ సమీక్ష కోసం వేచి ఉంది.", checkStatusBtn: "🔄 స్థితి తనిఖీ", returnLoginBtn: "🚪 లాగిన్‌కి తిరిగి",
    customModalTitle: "కొత్త వస్తువు", customModalSub: "అడ్మిన్ ఆమోదం", customNameLabel: "వస్తువు పేరు *", customUnitLabel: "యూనిట్ *", submitReqBtn: "అభ్యర్థన పంపు",
    tabAnalytics: "📊 అనలిటిక్స్", tabApprovals: "ఆమోదాలు", colType: "రకం", colItemSummary: "సారాంశం", colEmail: "ఇమెయిల్", colRegTime: "నమోదు", colUsername: "పేరు", colReqBy: "అభ్యర్థించినవారు", colItemName: "వస్తువు", colUnit: "యూనిట్", noPendingAccounts: "పెండింగ్ ఖాతాలు లేవు.", noPendingItems: "పెండింగ్ అభ్యర్థనలు లేవు.", analyticsTitle: "విభాగం ప్రకారం స్టాక్", analyticsSub: "8 విభాగాలలో లైవ్ మెట్రిక్స్", exportLedgerBtn: "లెడ్జర్ (CSV)", exportLogsBtn: "లాగ్‌లు (CSV)"
  }
};

// Current Active Language
let currentLang = localStorage.getItem('sreeambal_lang') || 'en';

/**
 * Helper: Translation Lookup
 */
function t(key) {
  const dict = I18N_DICTIONARY[currentLang] || I18N_DICTIONARY['en'];
  return dict[key] || I18N_DICTIONARY['en'][key] || key;
}

/**
 * Helper: Switch Language and Update all tagged DOM Elements
 */
function switchLanguage(newLang) {
  if (!I18N_DICTIONARY[newLang]) return;
  currentLang = newLang;
  localStorage.setItem('sreeambal_lang', newLang);
  applyTranslations();
  console.log('[i18n] Switched language to:', newLang);
}

/**
 * Helper: Apply translations to DOM elements with data-i18n attribute
 */
function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key) el.textContent = t(key);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key) el.setAttribute('placeholder', t(key));
  });

  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (key) el.setAttribute('title', t(key));
  });

  // Re-render dynamic components if app is ready
  if (typeof renderCatalogGrid === 'function') {
    renderCatalogGrid();
  }
  if (typeof renderAdminDashboard === 'function' && document.getElementById('view-admin') && !document.getElementById('view-admin').classList.contains('hidden')) {
    renderAdminDashboard();
  }
}
