// ==================== SUPABASE CONFIGURATION ====================
const SUPABASE_URL = 'https://mubvymfmeumeiijfdxiy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_03_xfgaZmqH2VFLVLO159Q_2x30w1NY';
const TABLE_NAME = 'applications';

// Initialize Supabase (变量名用 supabaseClient，避免和全局的 supabase 对象重名)
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// ================================================================

// 自动获取需要分配的管理员（先查询再返回，修复分配失效bug）
async function getAssignAdmin() {
    const adminList = ['ZHANG','SUN','CHENG'];
    const countMap = {};
    // 批量查询每个管理员待审核(pending)申请数量
    for (const admin of adminList) {
        const { count, error } = await supabaseClient
            .from(TABLE_NAME)
            .select('id', { count: 'exact', head: true })
            .eq('assigned_admin', admin)
            .eq('status', 'pending');
        countMap[admin] = error ? 0 : count;
    }
    // 取待审核最少的管理员，数量相同按 ZHANG > SUN > CHENG 顺序分配
    let targetAdmin = adminList[0];
    let minCount = countMap[targetAdmin];
    for (const a of adminList) {
        if (countMap[a] < minCount) {
            minCount = countMap[a];
            targetAdmin = a;
        }
    }
    return targetAdmin;
}

// Form submission handler
document.getElementById('application-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submit-btn');
    const originalText = submitBtn.textContent;
    
    // Get form data
    const fullName = document.getElementById('fullName').value;
    const phoneNumber = document.getElementById('phoneNumber').value;
    const telegramContact = document.getElementById('telegramContact').value;
    const cityState = document.getElementById('cityState').value;
    const aboutYourself = document.getElementById('aboutYourself').value;
    const otherInfo = document.getElementById('otherInfo').value;
    
    // Validate required fields
    const understoodRequirements = document.querySelector('input[name="understoodRequirements"]:checked');
    const confirmRequirements = Array.from(document.querySelectorAll('input[name="confirmRequirements"]:checked')).map(el => el.value);
    const peopleCount = document.querySelector('input[name="peopleCount"]:checked');
    const userAcquisition = Array.from(document.querySelectorAll('input[name="userAcquisition"]:checked')).map(el => el.value);
    
    if (!fullName || !phoneNumber || !telegramContact || !cityState || !aboutYourself ||
        !understoodRequirements || confirmRequirements.length === 0 || 
        !peopleCount || userAcquisition.length === 0) {
        alert('Please fill in all required fields.');
        return;
    }

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="inline-block animate-spin mr-2">⏳ Submitting...</';

    try {
        // 【关键修复】先计算分配管理员，再组装数据插入
        const targetAdmin = await getAssignAdmin();
        // Prepare data for Supabase
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
            assigned_admin: targetAdmin, // 预先算出再写入，不会空
            status: 'pending'
        };

        // Insert into Supabase
        const { error } = await supabaseClient
            .from(TABLE_NAME)
            .insert([formData]);

        if (error) throw error;

        // Show thank you page
        document.getElementById('main-content').classList.add('hidden');
        document.getElementById('thank-you-page').classList.remove('hidden');
        document.getElementById('thank-you-name').textContent = fullName;
        window.scrollTo(0, 0);

    } catch (error) {
        console.error('Submission error:', error);
        alert('There was an error submitting your application. Please try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

// Reset form function
function resetForm() {
    document.getElementById('application-form').reset();
    document.getElementById('thank-you-page').classList.add('hidden');
    document.getElementById('main-content').classList.remove('hidden');
    window.scrollTo(0, 0);
}

// Add checked state styling for radio/checkbox labels
document.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(input => {
    input.addEventListener('change', function() {
        // For radio buttons in the same group
        if (this.type === 'radio') {
            const name = this.name;
            document.querySelectorAll(`input[name="${name}"]`).forEach(radio => {
                radio.closest('label').classList.remove('border-primary-500', 'bg-primary-50');
                radio.closest('label').classList.add('border-gray-200');
            });
        }
        
        // Add/remove checked styling
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

// Smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});