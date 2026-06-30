// ==================== SUPABASE CONFIGURATION ====================
const SUPABASE_URL = 'https://mubvymfmeumeiijfdxiy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_03_xfgaZmqH2VFLVLO159Q_2x30w1NY';
const TABLE_NAME = 'applications';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// ================================================================

let selectedWorkMode = '';

// 切换全职/兼职表单显示
function switchWorkForm(mode) {
    selectedWorkMode = mode;
    document.getElementById('modeTip').classList.add('hidden');
    if(mode === 'fulltime'){
        document.getElementById('fulltime-form-wrap').classList.remove('hidden');
        document.getElementById('parttime-form-wrap').classList.add('hidden');
    }else{
        document.getElementById('fulltime-form-wrap').classList.add('hidden');
        document.getElementById('parttime-form-wrap').classList.remove('hidden');
    }
    window.scrollTo({top:600, behavior:'smooth'});
}

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

// 全局手机号校验
function formPhoneValidate(phoneVal) {
    if (phoneVal !== '' && !/^[0-9]{10}$/.test(phoneVal)) {
        alert('Phone number format error! Must be exactly 10 digits numbers only.');
        return false;
    }
    return true;
}

// ---------------------- 全职表单提交 ----------------------
document.getElementById('fulltime-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    if(!selectedWorkMode){
        document.getElementById('modeTip').classList.remove('hidden');
        return;
    }
    const submitBtn = this.querySelector('button[type="submit"]');
    const originText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    const formData = new FormData(this);
    const phone = formData.get('phoneNumber').trim();
    if(!formPhoneValidate(phone)){
        submitBtn.disabled = false;
        submitBtn.textContent = originText;
        return;
    }

    const confirmArr = Array.from(this.querySelectorAll('input[name="confirmRequirements"]:checked')).map(i=>i.value);
    const acquireArr = Array.from(this.querySelectorAll('input[name="userAcquisition"]:checked')).map(i=>i.value);

    const insertData = {
        work_type: 'fulltime',
        full_name: formData.get('fullName').trim(),
        phone_number: phone,
        telegram_contact: formData.get('telegramContact').trim(),
        city_state: formData.get('cityState').trim(),
        about_yourself: formData.get('aboutYourself').trim(),
        understood_requirements: formData.get('understoodRequirements'),
        confirm_requirements: confirmArr,
        people_count: formData.get('peopleCount'),
        user_acquisition: acquireArr,
        other_info: formData.get('otherInfo')?.trim() || null,
        submitted_at: new Date().toISOString(),
        assigned_admin: null,
        status: 'pending',
        archived_at: null
    };

    try {
        const {error} = await supabaseClient.from(TABLE_NAME).insert([insertData]);
        if(error) throw error;
        showThankPage(insertData.full_name);
    } catch(err){
        alert('Submit failed: '+err.message);
        submitBtn.disabled = false;
        submitBtn.textContent = originText;
    }
});

// ---------------------- 兼职表单提交 ----------------------
document.getElementById('parttime-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    if(!selectedWorkMode){
        document.getElementById('modeTip').classList.remove('hidden');
        return;
    }
    const submitBtn = this.querySelector('button[type="submit"]');
    const originText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    const formData = new FormData(this);
    const phone = formData.get('phoneNumber').trim();
    if(!formPhoneValidate(phone)){
        submitBtn.disabled = false;
        submitBtn.textContent = originText;
        return;
    }

    const insertData = {
        work_type: 'parttime',
        full_name: formData.get('fullName').trim(),
        phone_number: phone,
        telegram_contact: formData.get('telegramContact').trim(),
        city_state: formData.get('cityState').trim(),
        about_yourself: formData.get('aboutYourself').trim(),
        understood_requirements: null,
        confirm_requirements: [],
        people_count: formData.get('peopleCount'),
        user_acquisition: [],
        other_info: null,
        submitted_at: new Date().toISOString(),
        assigned_admin: null,
        status: 'pending',
        archived_at: null
    };

    try {
        const {error} = await supabaseClient.from(TABLE_NAME).insert([insertData]);
        if(error) throw error;
        showThankPage(insertData.full_name);
    } catch(err){
        alert('Submit failed: '+err.message);
        submitBtn.disabled = false;
        submitBtn.textContent = originText;
    }
});

// 跳转成功页面
function showThankPage(name){
    document.getElementById('main-content').classList.add('hidden');
    document.getElementById('thank-you-page').classList.remove('hidden');
    document.getElementById('thank-you-name').textContent = name;
    window.scrollTo(0,0);
}

// 重置全部内容
function resetForm() {
    selectedWorkMode = '';
    document.querySelectorAll('input[name="workMode"]').forEach(r=>r.checked=false);
    document.getElementById('fulltime-form-wrap').classList.add('hidden');
    document.getElementById('parttime-form-wrap').classList.add('hidden');
    document.getElementById('fulltime-form').reset();
    document.getElementById('parttime-form').reset();
    document.getElementById('phoneTip').classList.add('hidden');
    document.getElementById('modeTip').classList.add('hidden');
    document.getElementById('thank-you-page').classList.add('hidden');
    document.getElementById('main-content').classList.remove('hidden');
    window.scrollTo(0, 0);
}

// 单选/复选框选中边框高亮
document.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(input => {
    input.addEventListener('change', function() {
        if (this.type === 'radio' && this.name !== 'workMode') {
            const name = this.name;
            document.querySelectorAll(`input[name="${name}"]`).forEach(radio => {
                radio.closest('label').classList.remove('border-primary-500', 'bg-primary-50');
                radio.closest('label').classList.add('border-gray-200');
            });
        }
        const label = this.closest('label');
        if(!label) return;
        if (this.checked) {
            label.classList.remove('border-gray-200');
            label.classList.add('border-primary-500', 'bg-primary-50');
        } else {
            label.classList.remove('border-primary-500', 'bg-primary-50');
            label.classList.add('border-gray-200');
        }
    });
});

// 锚点平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
});
