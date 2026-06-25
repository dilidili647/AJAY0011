// ==================== SUPABASE CONFIGURATION ====================
const SUPABASE_URL = 'https://mubvymfmeumeiijfdxiy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_03_xfgaZmqH2VFLVLO159Q_2x30w1NY';
const TABLE_NAME = 'applications';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// ================================================================

// 手机号实时校验：严格10位纯数字
function checkPhone(val) {
    const tip = document.getElementById('phoneTip');
    const reg = /^[0-9]{10}$/;
    if (val.length > 0 && !reg.test(val)) {
        tip.classList.remove('hidden');
        return false;
    } else {
        tip.classList.add('hidden');
        return true;
    }
}

// TG账号实时校验：必须以@开头
function checkTg(val) {
    const tip = document.getElementById('tgTip');
    if (val.length > 0 && !val.startsWith('@')) {
        tip.classList.remove('hidden');
        return false;
    } else {
        tip.classList.add('hidden');
        return true;
    }
}

// 表单全局校验，提交前拦截
function formFullValidate() {
    const phoneVal = document.getElementById('phoneNumber').value.trim();
    const tgVal = document.getElementById('telegramContact').value.trim();
    const phonePass = checkPhone(phoneVal);
    const tgPass = checkTg(tgVal);

    if (phoneVal !== '' && !phonePass) {
        alert('Phone number format error! Must be exactly 10 digits numbers only.');
        document.getElementById('phoneNumber').focus();
        return false;
    }
    if (tgVal !== '' && !tgPass) {
        alert('Telegram contact must start with @ symbol!');
        document.getElementById('telegramContact').focus();
        return false;
    }
    return true;
}

document.getElementById('application-form').addEventListener('submit', function(e) {
    e.preventDefault();
    console.log("【表单】触发表单提交");

    // 先执行手机号、TG格式校验，不通过直接阻断提交
    if (!formFullValidate()) return;
    
    const submitBtn = document.getElementById('submit-btn');
    const originalText = submitBtn.textContent;

    const fullName = document.getElementById('fullName').value.trim();
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    const telegramContact = document.getElementById('telegramContact').value.trim();
    const cityState = document.getElementById('cityState').value.trim();
    const aboutYourself = document.getElementById('aboutYourself').value.trim();
    const otherInfo = document.getElementById('otherInfo').value.trim();

    const understoodRequirements = document.querySelector('input[name="understoodRequirements"]:checked');
    const confirmRequirements = Array.from(document.querySelectorAll('input[name="confirmRequirements"]:checked')).map(el => el.value);
    const peopleCount = document.querySelector('input[name="peopleCount"]:checked');
    const userAcquisition = Array.from(document.querySelectorAll('input[name="userAcquisition"]:checked')).map(el => el.value);

    if (!fullName || !phoneNumber || !telegramContact || !cityState || !aboutYourself ||
        !understoodRequirements || confirmRequirements.length === 0 || 
        !peopleCount || userAcquisition.length === 0) {
        alert('Please fill all required fields and tick all confirmation items');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>⏳ Submitting...</span>';

    // 新申请统一未分配
    const formData = {
        full_name: fullName,
        phone_number: phoneNumber,
        telegram_contact: telegramContact,
        city_state: cityState,
        about_yourself: aboutYourself,
        understood_requirements: understoodRequirements.value,
        confirm_requirements: confirmRequirements,
        people_count: peopleCount.value,
        user_acquisition: userAcquisition,
        other_info: otherInfo,
        submitted_at: new Date().toISOString(),
        assigned_admin: null,
        status: 'pending'
    };
    console.log("【表单】待提交数据（未分配）", formData);

    supabaseClient.from(TABLE_NAME)
        .insert([formData])
        .then(res => {
            if(res.error) throw res.error;
            document.getElementById('main-content').classList.add('hidden');
            document.getElementById('thank-you-page').classList.remove('hidden');
            document.getElementById('thank-you-name').textContent = fullName;
            window.scrollTo(0, 0);
        })
        .catch(err => {
            console.error('提交失败', err);
            alert('Submit failed, please try again');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        });
});

function resetForm() {
    document.getElementById('application-form').reset();
    // 重置校验提示隐藏
    document.getElementById('phoneTip').classList.add('hidden');
    document.getElementById('tgTip').classList.add('hidden');
    document.getElementById('thank-you-page').classList.add('hidden');
    document.getElementById('main-content').classList.remove('hidden');
    window.scrollTo(0, 0);
}

document.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(input => {
    input.addEventListener('change', function() {
        if (this.type === 'radio') {
            const name = this.name;
            document.querySelectorAll(`input[name="${name}"]`).forEach(radio => {
                radio.closest('label').classList.remove('border-primary-500', 'bg-primary-50');
                radio.closest('label').classList.add('border-gray-200');
            });
        }
        const label = this.closest('label');
        if (this.checked) {
            label.classList.remove('border-gray-200');
            label.classList.add('border-primary-500', 'bg-primary-50');
        } else {
            label.classList.remove('border-primary-500', 'bg-primary-50');
            label.classList.add('border-gray-200');
        }
    });
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
});
