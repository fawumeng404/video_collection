let videos = []; // Store all videos data
let currentTags = []; // Tags selected for filtering
let currentRating = 'all'; // Rating filter: 'all', 0, 1, 2, 3, 4, 5
// 从本地存储加载标签数组
let tagsArray = JSON.parse(localStorage.getItem('tagsArray')) || ["全部", "标签1", "标签2", "标签3", "标签4"];
//let selectedTagsArray = JSON.parse(localStorage.getItem('selectedTags')) || [];

let searchTagsArray = tagsArray; // 搜索时显示的标签
let ccsearchTagsArray = tagsArray; // 搜索时显示的标签
let ccselectedTagsArray = []; 
// 初始标签数组，包含一些默认标签
// let tagsArray = ["全部", "标签1", "标签2", "标签3", "标签4"];
// 视频添加界面
// 获取当前页面的唯一标识符（例如，页面的 URL 或其他标识符）
let pageId = null;  // 或者你可以用其他标识符

// 1. 保存当前滚动位置
// window.addEventListener('scroll', () => {
//   localStorage.setItem(`scrollPosition_${pageId}`, window.scrollY);
//   sessionStorage.setItem(`scrollPosition_${pageId}`, window.scrollY);
// });

// 2. 页面加载时恢复滚动位置
// window.addEventListener('load', () => {
//   const savedScrollPosition = localStorage.getItem(`scrollPosition_${pageId}`);
  
//   if (savedScrollPosition !== null) {
//     window.scrollTo(0, savedScrollPosition);
//   }
// });


function showAddVideoPage() {
    document.getElementById('addVideoSection').style.display = 'block';
    document.getElementById('favoritesSection').style.display = 'none';
    document.getElementById('videoDetailPage').style.display = 'none';
    document.getElementById('editForm').style.display = 'none';
    document.getElementById('messageModal').style.display = 'none';
    
}

// 我的收藏界面
function showFavoritesPage() {
    document.getElementById('addVideoSection').style.display = 'none';
    document.getElementById('favoritesSection').style.display = 'block';
    document.getElementById('videoDetailPage').style.display = 'none';
    document.getElementById('editForm').style.display = 'none';
    document.getElementById('messageModal').style.display = 'none';
    pageId = 'favoritesSection';
    renderVideoList();  // Ensure the favorites section is rendered when switching to it
}

function sortTags(tags) {
    // 定义需要按特定顺序排在前面的标签，并为它们指定排序顺序
    const priorityTags = ["全部"];
    
    // 对 priorityTags 标签按顺序排序并提取它们
    const priorityTagsArray = tags.filter(tag => priorityTags.includes(tag))
                                   .sort((tagA, tagB) => priorityTags.indexOf(tagA) - priorityTags.indexOf(tagB));

    // 过滤掉优先级标签后的其他标签
    const otherTagsArray = tags.filter(tag => !priorityTags.includes(tag));

    // 按拼音排序其他标签（使用localeCompare方法实现拼音排序）
    otherTagsArray.sort((tagA, tagB) => tagA.localeCompare(tagB));

    // 返回组合后的标签数组，优先级标签按指定顺序排在前面，剩下的标签按拼音排序
    return [...priorityTagsArray, ...otherTagsArray];
}

// 拼音首字母映射表（根据常见汉字的拼音首字母简化）
const pinyinMap = {
    "a": ["阿", "啊", "爱", "安", "艾", "暗", "昂", "澳"],
    "b": ["把", "吧", "百", "班", "办", "包", "北", "本", "比", "别", "宾"],
    "c": ["才", "参", "长", "差", "超", "成", "池", "次", "从", "崇", "此"],
    "d": ["大", "达", "代", "带", "当", "到", "道", "待", "打", "低", "地"],
    "e": ["饿", "恩", "而", "额", "恶", "鹅", "二", "尔", "易", "额"],
    "f": ["发", "法", "反", "放", "方", "非", "费", "富", "扶", "赴", "复"],
    "g": ["高", "个", "给", "共", "工", "光", "果", "国", "关", "贵", "桂"],
    "h": ["好", "哈", "花", "华", "会", "海", "后", "红", "河", "和", "胡"],
    "j": ["加", "家", "间", "建", "计", "将", "久", "解", "极", "基", "金"],
    "k": ["考", "开", "卡", "可", "空", "快", "看", "刻", "科", "克", "坑"],
    "l": ["来", "了", "力", "利", "连", "老", "力", "蓝", "拉", "李", "林"],
    "m": ["妈", "马", "门", "美", "民", "名", "没", "面", "密", "名", "木"],
    "n": ["那", "南", "能", "内", "你", "年", "脑", "难", "拿", "奶", "怒"],
    "o": ["哦", "偶", "欧", "饿"],
    "p": ["怕", "跑", "配", "平", "片", "朋", "贫", "破", "扑", "评", "盘"],
    "q": ["起", "气", "前", "球", "群", "区", "确", "千", "强", "巧", "清"],
    "r": ["热", "然", "入", "人", "日", "如", "然", "让", "容", "瑞", "饶"],
    "s": ["是", "上", "三", "思", "生", "死", "手", "社", "所", "书", "时"],
    "t": ["他", "她", "它", "太", "天", "特", "体", "头", "通", "投", "同"],
    "w": ["我", "为", "问", "无", "五", "外", "物", "万", "王", "闻", "伟"],
    "x": ["下", "西", "心", "先", "些", "信", "行", "学", "笑", "想", "迅"],
    "y": ["有", "一", "样", "与", "应", "艺", "音", "友", "远", "业", "扬"],
    "z": ["在", "中", "做", "找", "自", "最", "字", "足", "早", "增", "长"]
};


// 搜索标签函数
function searchTags() {
    const searchTerm = document.getElementById('newTag').value.trim(); // 获取搜索词并去除前后空格
    
    if (searchTerm === '') {
        searchTagsArray = tagsArray; // 如果搜索框为空，显示所有标签
    } else {
        searchTagsArray = tagsArray.filter(tag => {
            // 将标签和搜索词都转换为小写进行匹配，忽略大小写
            const lowerSearchTerm = searchTerm.toLowerCase();
            
            // 获取标签的拼音首字母（提取拼音首字母）
            const pinyinFirstLetter = getPinyinFirstLetter(tag).toLowerCase();
            
            // 判断搜索词是否匹配标签的拼音首字母或标签名称
            return tag.toLowerCase().includes(lowerSearchTerm) || pinyinFirstLetter.includes(lowerSearchTerm);
        });
    }

    updateTagSelect(); // 更新标签显示
    document.getElementById('newTag').value = ''; // 清空输入框
}
document.getElementById('newTag').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        searchTags(); // 按下 Enter 键时调用搜索函数
    }
});
// 获取标签拼音首字母（简单的拼音映射）
function getPinyinFirstLetter(tag) {
    let firstLetter = '';
    
    // 遍历标签的每个字符
    for (let char of tag) {
        const charLower = char.toLowerCase();
        
        // 如果是字母直接加上
        if (/[a-zA-Z]/.test(char)) {
            firstLetter += charLower;
        }
        // 如果是汉字，查找拼音首字母
        else if (/[一-龥]/.test(char)) {
            for (let key in pinyinMap) {
                if (pinyinMap[key].includes(char)) {
                    firstLetter += key;
                    break;
                }
            }
        }
    }
    
    return firstLetter;
}


// 更新标签显示
// 更新标签显示
function updateTagSelect() {
    // const selectedTagsBeforeSearch = Array.from(document.querySelectorAll('#tags input[type="checkbox"]:checked'))
    // .map(checkbox => checkbox.value);
    const tagsContainer = document.getElementById('tags'); // 获取显示标签的容器
    tagsContainer.innerHTML = ''; // 清空现有选项，以便重新渲染标签

    // 排序标签数组
    const sortedTagsArray = sortTags(searchTagsArray); // 使用 searchTagsArray 来显示搜索结果

    // 遍历排序后的 tagsArray 数组中的所有标签
    sortedTagsArray.forEach(tag => {
        // 创建一个 label 元素，用来包装复选框和标签文本
        const label = document.createElement('label');
        
        // 创建一个复选框元素
        const checkbox = document.createElement('input');
        checkbox.type = "checkbox"; // 设置为复选框类型
        checkbox.value = tag; // 设置复选框的值为当前标签
        checkbox.id = tag; // 设置复选框的 id 为标签的名称

        // 如果是 "全部" 标签，则默认选中并禁用
        if (tag === "全部") {
            checkbox.checked = true; // "全部" 标签默认选中
            checkbox.disabled = true; // 禁用 "全部" 标签的复选框
            updateBeforeSelectedTags(tag, checkbox.checked);
        } else {
            // 这里检查复选框是否在保存的选中标签中
            checkbox.checked = selectedTagsBeforeSearch.includes(tag);
            console.log(checkbox.checked);
        }

        // 为复选框添加点击事件，触发标签选择更新
        checkbox.onclick = function () {
             // 每次点击复选框时，更新已选择标签的显示
            // 在更新标签前，保存当前选中的标签
            updateBeforeSelectedTags(tag, checkbox.checked);
            updateSelectedTags();
        };

        // 将复选框和标签文本追加到 label 元素中
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(tag)); // 创建一个文本节点并将标签名添加到 label 中

        // 将 label 元素添加到标签容器
        tagsContainer.appendChild(label);
        //tagsContainer.appendChild(document.createElement('br')); // 在每个标签后添加换行
    });
}
// 在每次点击复选框时，更新选中的标签
function updateBeforeSelectedTags(tag, isChecked) {
    if (isChecked) {
        // 如果复选框被选中，则将标签添加到 selectedTagsBeforeSearch 中
        if (!selectedTagsBeforeSearch.includes(tag)) {
            selectedTagsBeforeSearch.push(tag);
        }
    } else {
        // 如果复选框被取消选中，则从 selectedTagsBeforeSearch 中移除标签
        selectedTagsBeforeSearch = selectedTagsBeforeSearch.filter(t => t !== tag);
    }
    console.log("更新后的选中标签: ", selectedTagsBeforeSearch);
}

let selectedTagsBeforeSearch = [];
// 更新已选择的标签显示
function updateSelectedTags() {
    const selectedTagsDiv = document.getElementById('selectedTags'); // 获取已选择标签的显示区域
    selectedTagsDiv.innerHTML = ''; // 清空已有选择

    // 获取所有选中的复选框
    
    
    // 遍历 selectedTagsBeforeSearch 中的值，更新显示
    selectedTagsBeforeSearch.forEach(tag => {
        // "全部" 标签不需要显示在已选标签区域
        if (tag !== "全部") {
            // 创建一个 span 元素，用于显示选中的标签
            const span = document.createElement('span');
            span.textContent = tag; // 设置 span 的文本为选中的标签名称
            
            // 为 span 元素添加点击事件，点击后取消选择该标签
            span.onclick = function () {
                // 取消复选框的选中状态
                const checkbox = document.querySelector(`#tags input[type="checkbox"][value="${tag}"]`);
                if (checkbox) {
                    checkbox.checked = false;
                    selectedTagsBeforeSearch = selectedTagsBeforeSearch.filter(t => t !== tag);
                }
                // 更新选中的标签列表
                updateSelectedTags();
            };
            
            // 将 span 元素添加到已选择标签的显示区域
            selectedTagsDiv.appendChild(span);
        }
    });

    // 将 "全部" 标签添加到选中的标签数组，并更新显示
    // if (selectedTagsBeforeSearch.includes("全部")) {
    //     const span = document.createElement('span');
    //     span.textContent = "全部"; // 显示 "全部"
    //     span.classList.add('selected-all'); // 可以给它添加样式，用于区分
    //     selectedTagsDiv.insertBefore(span, selectedTagsDiv.firstChild); // 放在最前面
    // }

    // 更新本地存储，保存已选择标签
    // localStorage.setItem('selectedTags', JSON.stringify(selectedTagsBeforeSearch));
}



// 添加新标签
function addTag() {
    const newTag = document.getElementById('newTag').value.trim(); // 获取用户输入的标签，并去除多余的空白字符

    // 如果标签非空且不重复，则添加到标签数组
    if (newTag && !tagsArray.includes(newTag)) {
        tagsArray.push(newTag); // 将新标签添加到 tagsArray 中
        searchTagsArray = tagsArray;
        updateTagSelect(); // 更新标签选择框，重新渲染标签列表

        // 将更新后的标签数组保存到本地存储
        localStorage.setItem('tagsArray', JSON.stringify(tagsArray));
    } else {
        showMessage('标签不能为空或已存在！'); // 如果标签为空或已存在，则提示用户
    }

    document.getElementById('newTag').value = ''; // 清空输入框
}




// 添加视频
// 显示提示信息
function showMessage(message) {
    const modal = document.getElementById('messageModal');
    const modalMessage = document.getElementById('modalMessage');
    const existingButtons = modal.querySelectorAll('button');
    existingButtons.forEach(button => button.remove());
    modalMessage.textContent = message;
    modal.style.display = 'block';  // 显示弹窗
}

// 关闭弹窗
function closeMessage() {
    const modal = document.getElementById('messageModal');
    modal.style.display = 'none';  // 隐藏弹窗
}

// 绑定关闭按钮的事件
document.getElementById('closeModal').onclick = closeMessage;
// 页面加载完成后自动显示弹窗
window.onload = function() {
    showMessage('请导入最新文件。');
};
// 也可以点击弹窗外部关闭
// window.onclick = function(event) {
//     const modal = document.getElementById('messageModal');
//     if (event.target === modal) {
//         closeMessage();
//     }
// }

// 例如，在添加视频成功时调用 showMessage() 显示提示信息
let importCounter = 0;  // 用于跟踪每次导入时生成的后缀数值

function addVideo() {
    const videoLink = document.getElementById('videoLink').value;
    const playLink = document.getElementById('playLink').value || "https://pic1.zhimg.com/v2-7eeab4cf1e4795eca54a1c172ab79c08_1440w.jpg"; // 获取播放链接
    const coverImage = document.getElementById('coverImage').value || "https://pic1.zhimg.com/v2-7eeab4cf1e4795eca54a1c172ab79c08_1440w.jpg";
    const title = document.getElementById('title').value || '无';
    const description = document.getElementById('description').value || '无';
    const protagonist = document.getElementById('protagonist').value || '无';
    const tags = selectedTagsBeforeSearch; // 获取已选标签
    const rating = parseInt(document.getElementById('rating').value) || 0;

    // 检查视频链接和封面链接是否填写
    if (!videoLink) {
        showMessage('请填写视频链接');
        return;
    }

    // 获取当前时间戳，按要求生成前半部分ID
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, ''); // 格式化时间：YYYYMMDDHHmmss
    const idPrefix = timestamp.slice(2, 17);  // 取时间戳的前部分，去除年份前两位，得到格式：MMDDHHmmss
    const idSuffix = '000';  // 默认后缀为 000

    // 生成唯一ID
    const id = idPrefix + idSuffix;

    const video = {
        id,
        videoLink,
        playLink, // 添加播放链接
        coverImage,
        title,
        description,
        protagonist,
        tags,
        rating,
        addedTime: new Date().toISOString() // 保存添加视频的时间
    };

    videos.push(video);
    videosaveToLocalStorage(); 

    // 输出添加成功的消息
    showMessage('视频添加成功！');
    resetForm();
    renderVideoList();      // 更新视频列表显示
    renderTagsList();
    console.log(video); // 这里可以替换成保存到数据库或本地存储等功能
}


// 保存到 localStorage
function videosaveToLocalStorage() {
    localStorage.setItem('videos', JSON.stringify(videos));
}
function resetForm() {
    document.getElementById('videoLink').value = '';
    document.getElementById('playLink').value = '';
    document.getElementById('coverImage').value = '';
    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
    document.getElementById('protagonist').value = '';
    document.getElementById('rating').value = '0';
    
    // 保留第一个标签，清除其他标签的选择
    const tagsCheckboxes = document.querySelectorAll('#tags input[type="checkbox"]');
    tagsCheckboxes.forEach((checkbox, index) => {
        if (index > 0) {  // 从第二个标签开始，取消选中
            checkbox.checked = false;
        }
    });
    selectedTagsBeforeSearch = [];
    document.getElementById('selectedTags').innerHTML = ''; // 清空已有选择
    
}
function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                const importedData = JSON.parse(event.target.result);

                // 确保导入的结构是正确的
                if (importedData.tags && Array.isArray(importedData.tags)) {
                    tagsArray = importedData.tags;
                }

                if (importedData.videos && Array.isArray(importedData.videos)) {
                    const newVideos = importedData.videos;
                    videos = newVideos;
                }

                // 更新标签和视频列表
                searchTagsArray = tagsArray;
                ccsearchTagsArray = tagsArray;
                saveToLocalStorage();   // 保存到本地存储
                updateTagSelect();
                renderVideoList();      // 更新视频列表显示
                renderTagsList();       // 更新标签列表

                showMessage('视频导入成功！');
            };
            reader.readAsText(file);
        } else {
            showMessage('导入的文件格式不正确，必须包含有效的视频数据！');
        }
    };
    input.click();
}
function importVideos() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                const importedData = JSON.parse(event.target.result);

                // 检查文件内容格式是否正确
                if (importedData.videos && Array.isArray(importedData.videos)) {
                    const newVideos = importedData.videos;

                    // 遍历新导入的视频并为每个视频生成唯一ID和时间戳
                    newVideos.forEach(video => {
                        // 如果视频没有 ID 则生成唯一 ID
                        //if (!video.id) {
                        const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, ''); // 格式化时间：YYYYMMDDHHmmss
                        const idPrefix = timestamp.slice(2, 17);  // 获取时间戳的前部分
                        const idSuffix = ('000' + importCounter).slice(-3); // 后缀从 000 开始递增

                            // 设置视频的唯一 ID
                        video.id = idPrefix + idSuffix;

                            // 更新循环计数器，保证后缀递增
                        importCounter = (importCounter + 1) % 1000;
                        //}

                        // 设置添加时间（addedTime）
                        video.addedTime = new Date().toISOString();

                        // 将新视频添加到现有的视频数组中
                        videos.push(video);
                    });

                    // 保存更新后的视频数组到 localStorage
                    saveToLocalStorage();

                    // 更新视频列表显示
                    renderVideoList();
                    renderTagsList();

                    // 输出提示信息
                    showMessage('视频导入成功！');
                } else {
                    showMessage('导入的文件格式不正确，必须包含有效的视频数据！');
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}


function exportData() {
    const dataToExport = {
        tags: tagsArray,  // 先导出标签数组
        videos: videos     // 然后导出视频数组
    };

    // 使用 JSON.stringify() 的第二个参数来格式化输出，缩进为 2 个空格
    const formattedData = JSON.stringify(dataToExport, null, 2);

    // 获取当前时间并格式化为 MMDDHHmm
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // 确保月份为两位数
    const day = String(now.getDate()).padStart(2, '0'); // 确保日期为两位数
    const hours = String(now.getHours()).padStart(2, '0'); // 确保小时为两位数
    const minutes = String(now.getMinutes()).padStart(2, '0'); // 确保分钟为两位数

    const timeString = month + day + hours + minutes; // 拼接为 MMDDHHmm

    // 创建 Blob 对象以导出为文件
    const blob = new Blob([formattedData], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    
    // 动态设置文件名，格式为 videosMMDDHHmm
    link.download = `videos${timeString}.json`; 
    link.click();
}


// 保存到 localStorage
function saveToLocalStorage() {
    localStorage.setItem('tagsArray', JSON.stringify(tagsArray));
    localStorage.setItem('videos', JSON.stringify(videos));
}



// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // 初始化标签选择框
    updateTagSelect();
    loadVideos(); // Load videos from localStorage when the page is loaded
    filterByRating('all');
    ccupdateSelectedTags(); 

    //switchPage('addVideo'); // Default page is Add Video Page
    //setupRatingFilter();
});

function loadVideos() {
    const storedVideos = localStorage.getItem('videos');
    if (storedVideos) {
        videos = JSON.parse(storedVideos); // Load data from localStorage
    }
    ccsearchTagsArray = tagsArray;
    renderTagsList(); // Render tags list
    renderVideoList(); // Render video list
    console.log(videos);
}
// 搜索标签函数
function ccsearchTags() {
    const searchTerm = document.getElementById('ccnewTag').value.trim(); // 获取搜索词并去除前后空格
    
    if (searchTerm === '') {
        ccsearchTagsArray = tagsArray; // 如果搜索框为空，显示所有标签
    } else {
        ccsearchTagsArray = tagsArray.filter(tag => {
            // 将标签和搜索词都转换为小写进行匹配，忽略大小写
            const lowerSearchTerm = searchTerm.toLowerCase();
            
            // 获取标签的拼音首字母（提取拼音首字母）
            const pinyinFirstLetter = getPinyinFirstLetter(tag).toLowerCase();
            
            // 判断搜索词是否匹配标签的拼音首字母或标签名称
            return tag.toLowerCase().includes(lowerSearchTerm) || pinyinFirstLetter.includes(lowerSearchTerm);
        
            
        });
    }
    renderTagsList(); // 更新标签显示
    document.getElementById('ccnewTag').value = ''; // 清空输入框
}
document.getElementById('ccnewTag').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        ccsearchTags(); // 按下 Enter 键时调用搜索函数
    }
});
// 渲染标签列表
function renderTagsList() { 
    const tagsUL = document.getElementById('tagsUL');
    tagsUL.innerHTML = '';  // 清空标签列表

    // 根据每个标签的视频数量从大到小排序
    ccsearchTagsArray.sort((tagA, tagB) => {
        const countA = getVideoCountForTag(tagA);
        const countB = getVideoCountForTag(tagB);
        return countB - countA;  // 从大到小排序
    });

    ccsearchTagsArray.forEach(tag => {
        if (tag !== "全部") {
            const tagCount = getVideoCountForTag(tag);
        const li = document.createElement('li');
        li.innerHTML = `${tag} (${tagCount})`;  // 显示标签和对应的视频数量
        li.onclick = function () { filterByTag(tag); };  // 点击标签添加到已选择区域
        tagsUL.appendChild(li);
        }
        
    });
}

// 获取视频中某个标签的数量
function getVideoCountForTag(tag) {
    return videos.filter(video => video.tags.includes(tag)).length;
}

// 处理点击标签
function filterByTag(tag) {
    // 如果标签已选择，移除它；如果未选择，添加它
    const index = ccselectedTagsArray.indexOf(tag);
    if (index === -1) {
        ccselectedTagsArray.push(tag);
    } 
    // else {
    //     ccselectedTagsArray.splice(index, 1);
    // }
    ccupdateSelectedTags();  // 更新已选标签显示
    currentPage = 1;
    renderVideoList();  // 刷新视频列表
}

// 更新已选择标签的显示区域
function ccupdateSelectedTags() { 
    const ccselectedTagsDiv = document.getElementById('ccselectedTags');
    ccselectedTagsDiv.innerHTML = '';  // 清空已选标签区域

    // 遍历选中的标签并显示
    ccselectedTagsArray.forEach(tag => {
        const span = document.createElement('span');
        span.textContent = tag;  // 标签名称
        const tagCount = getVideoCountForTag(tag);  // 获取标签的视频数量
        const countText = document.createElement('span');
        countText.textContent = ` (${tagCount})`;  // 显示标签的视频数量
        span.appendChild(countText);  // 将数量显示附加到标签后面

        // 点击取消选择
        span.onclick = function () {
            const index = ccselectedTagsArray.indexOf(tag);
            if (index > -1) {
                ccselectedTagsArray.splice(index, 1);
            }
            ccupdateSelectedTags();  // 更新显示
            currentPage = 1;
            renderVideoList();  // 刷新视频列表
        };

        ccselectedTagsDiv.appendChild(span);
    });
}
// 显示确认提示信息并执行回调
function showConfirmMessage(message, onConfirm) {
    const modal = document.getElementById('messageModal');
    const modalMessage = document.getElementById('modalMessage');
    modalMessage.textContent = message;

    // 清除之前的按钮，以避免影响下一次弹窗
    const existingButtons = modal.querySelectorAll('button');
    existingButtons.forEach(button => button.remove());

    const confirmButton = document.createElement('button');
    confirmButton.textContent = '确认';
    confirmButton.onclick = () => {
        closeMessage();  // 关闭弹窗
        onConfirm();  // 调用回调
        
    };

    const cancelButton = document.createElement('button');
    cancelButton.textContent = '取消';
    cancelButton.onclick = () => closeMessage();  // 关闭弹窗

    const buttonsContainer = document.createElement('div');
    buttonsContainer.appendChild(confirmButton);
    buttonsContainer.appendChild(cancelButton);
    modal.appendChild(buttonsContainer);

    modal.style.display = 'block';  // 显示弹窗
}
// 获取输入框的值并清空
function getNewTagInputValue() {
    return document.getElementById('ccnewTag').value.trim();
}

// 添加标签
function ccaddTag() {
    const newTag = getNewTagInputValue();  // 获取输入框的值
    
    if (newTag && !tagsArray.includes(newTag)) {
        tagsArray.push(newTag);
        localStorage.setItem('tagsArray', JSON.stringify(tagsArray));
        ccsearchTagsArray = tagsArray;
        renderTagsList();  // 更新标签列表
        showMessage('标签已添加！');  // 显示提示信息
    } else if (!newTag) {
        showMessage('请输入标签名称以添加！');  // 提示输入标签
    } else if (tagsArray.includes(newTag)) {
        showMessage('该标签已存在！');  // 提示标签已存在
    }

    // 清空输入框
    document.getElementById('ccnewTag').value = '';
}

// 删除标签
function ccdeleteTag() {
    const tagToDelete = getNewTagInputValue();  // 获取要删除的标签名
    
    if (!tagToDelete) {
        showMessage('请输入标签名称以删除！');  // 提示输入标签
        return;
    }

    // 弹出确认删除提示框
    showConfirmMessage(`是否确认删除标签 "${tagToDelete}"？`, function() {
        const index = tagsArray.indexOf(tagToDelete);

        if (index > -1) {
            // 判断该标签是否在任何视频中被使用
            const videoCount = getVideoCountForTag(tagToDelete);
            if (videoCount > 0) {
                showMessage(`该标签被 ${videoCount} 个视频使用，无法删除！`);
            } else {
                // 删除标签
                tagsArray.splice(index, 1);
                selectedTagsArray = selectedTagsArray.filter(tag => tag !== tagToDelete);  // 删除已选标签中的该标签

                // 更新本地存储和标签列表
                localStorage.setItem('tagsArray', JSON.stringify(tagsArray));
                ccsearchTagsArray = tagsArray;
                renderTagsList();  // 更新标签列表
                ccupdateSelectedTags();  // 更新已选标签显示区域

                showMessage('标签已删除！');
            }
        } else {
            showMessage('标签不存在！');
        }

       
    });
    document.getElementById('ccnewTag').value = '';
}

function filterByRating(rating) {
    currentRating = rating;

    // 先移除所有按钮的选中状态
    const buttons = document.querySelectorAll('.rating-buttons button');
    buttons.forEach(button => {
        button.classList.remove('selected');
    });

    // 为当前选中的按钮添加选中状态
    const selectedButton = Array.from(buttons).find(button => {
        return button.textContent == rating || (rating === 'all' && button.textContent === '全部');
    });

    if (selectedButton) {
        selectedButton.classList.add('selected');
    }
    currentPage = 1;
    renderVideoList();
}


// 假设每页显示40个视频
const videosPerPage = 20;
let currentPage = 1;  // 当前页，默认从第一页开始

function renderPagination(totalVideos) {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';  // 清空现有分页按钮

    // 如果没有视频，禁用分页按钮
    if (totalVideos === 0) {
        const prevButton = document.createElement('button');
        prevButton.innerText = '上一页';
        prevButton.disabled = true;
        paginationContainer.appendChild(prevButton);

        const nextButton = document.createElement('button');
        nextButton.innerText = '下一页';
        nextButton.disabled = true;
        paginationContainer.appendChild(nextButton);
        return;  // 结束函数，不继续生成其他分页内容
    }

    const totalPages = Math.ceil(totalVideos / videosPerPage);

    // 显示 "上一页" 按钮
    const prevButton = document.createElement('button');
    prevButton.innerText = '上一页';
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => changePage(currentPage - 1,totalVideos);
    paginationContainer.appendChild(prevButton);

    // 显示页面按钮
    if (totalPages <= 5) {
        // 如果总页数 <= 5，显示所有页数
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.innerText = i;
            pageButton.disabled = i === currentPage;
            pageButton.onclick = () => changePage(i,totalVideos);
            paginationContainer.appendChild(pageButton);
        }
    } else {
        // 如果总页数 >= 5，处理分页显示
        if (currentPage === 1) {
            // 当当前页为第一页时，显示第一页、第二页、第三页、... 和最后一页
            for (let i = 1; i <= 3; i++) {
                const pageButton = document.createElement('button');
                pageButton.innerText = i;
                pageButton.disabled = i === currentPage;
                pageButton.onclick = () => changePage(i,totalVideos);
                paginationContainer.appendChild(pageButton);
            }

            // 省略号
            const ellipsis = document.createElement('span');
            ellipsis.innerText = '...';
            paginationContainer.appendChild(ellipsis);

            // 最后一页按钮
            const lastPageButton = document.createElement('button');
            lastPageButton.innerText = totalPages;
            lastPageButton.onclick = () => changePage(totalPages,totalVideos);
            paginationContainer.appendChild(lastPageButton);

        } else if (currentPage === totalPages || currentPage === totalPages - 1 || currentPage === totalPages - 2) {
            // 当当前页为最后一页时，显示第一页、...、倒数三页
            const firstPageButton = document.createElement('button');
            firstPageButton.innerText = 1;
            firstPageButton.onclick = () => changePage(1,totalVideos);
            paginationContainer.appendChild(firstPageButton);

            // 省略号
            const ellipsis = document.createElement('span');
            ellipsis.innerText = '...';
            paginationContainer.appendChild(ellipsis);

            // 显示倒数三页
            for (let i = totalPages - 3; i <= totalPages; i++) {
                const pageButton = document.createElement('button');
                pageButton.innerText = i;
                pageButton.disabled = i === currentPage;
                pageButton.onclick = () => changePage(i,totalVideos);
                paginationContainer.appendChild(pageButton);
            }

        } else {
            // 如果当前页不是第一页、倒数第二页或最后一页
            const startPage = Math.max(1, currentPage - 1); // 当前页前一个或第一页
            const endPage = Math.min(totalPages, currentPage + 1); // 当前页后一个或最后一页

            // 显示当前页及相邻页
            for (let i = startPage; i <= endPage; i++) {
                const pageButton = document.createElement('button');
                pageButton.innerText = i;
                pageButton.disabled = i === currentPage;
                pageButton.onclick = () => changePage(i,totalVideos);
                paginationContainer.appendChild(pageButton);
            }

            // 显示省略号
            if (endPage < totalPages) {
                const ellipsis = document.createElement('span');
                ellipsis.innerText = '...';
                paginationContainer.appendChild(ellipsis);

                // 最后一页按钮
                const lastPageButton = document.createElement('button');
                lastPageButton.innerText = totalPages;
                lastPageButton.onclick = () => changePage(totalPages,totalVideos);
                paginationContainer.appendChild(lastPageButton);
            }
        }
    }

    // 显示 "下一页" 按钮
    const nextButton = document.createElement('button');
    nextButton.innerText = '下一页';
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = () => changePage(currentPage + 1,totalVideos);
    paginationContainer.appendChild(nextButton);
}





// 切换页面
function changePage(page,totalVideos) {
    currentPage = page;
    renderVideoList(); // 重新渲染视频列表
    renderPagination(totalVideos); // 重新渲染分页按钮
}

// 渲染视频列表
let searchQuery = '';  // 用于存储搜索关键字

// 搜索功能
function searchVideos() {
    const searchInput = document.getElementById('searchInput');
    searchQuery = searchInput.value.trim().toLowerCase(); // 转换为小写，进行不区分大小写的搜索
    currentPage = 1;
    renderVideoList();  // 重新渲染视频列表
    searchInput.value = '';  // 清空输入框
}



let currentFilter = null;
let currentSort = null;
let randomnum = 1;
let randomfilteredVideos = null;
// 显示选项的点击事件
document.getElementById('showButton').addEventListener('click', (e) => {
  const showOptions = document.getElementById('showOptions');
  const sortOptions = document.getElementById('sortOptions');
  
  // 切换显示或隐藏悬浮列表
  showOptions.style.display = showOptions.style.display === 'none' ? 'block' : 'none';
  sortOptions.style.display = 'none';  // 确保排序选项隐藏

  e.stopPropagation();  // 阻止事件冒泡，避免触发文档的点击事件
});

// 排序选项的点击事件
document.getElementById('sortButton').addEventListener('click', (e) => {
  const sortOptions = document.getElementById('sortOptions');
  const showOptions = document.getElementById('showOptions');
  
  // 切换显示或隐藏悬浮列表
  sortOptions.style.display = sortOptions.style.display === 'none' ? 'block' : 'none';
  showOptions.style.display = 'none';  // 确保显示选项隐藏

  e.stopPropagation();  // 阻止事件冒泡，避免触发文档的点击事件
});

// 点击页面其他地方时隐藏显示和排序悬浮列表
document.addEventListener('click', () => {
  document.getElementById('showOptions').style.display = 'none';
  document.getElementById('sortOptions').style.display = 'none';
  
  
});

// 筛选视频的函数
function filterVideos(filterType) {
  currentFilter = filterType;
  renderVideoList();
  closeAllDropdowns();  // 点击后关闭悬浮列表
}

// 排序视频的函数
function sortVideos(sortType) {
  randomnum = 0;
  currentSort = sortType;
  renderVideoList();
  closeAllDropdowns();  // 点击后关闭悬浮列表
}

// 恢复所有视频显示的筛选条件
function resetFilters() {
  currentFilter = null;
  renderVideoList();
  closeAllDropdowns();  // 点击后关闭悬浮列表
}

// 关闭所有的悬浮列表
function closeAllDropdowns() {
  document.getElementById('showOptions').style.display = 'none';
  document.getElementById('sortOptions').style.display = 'none';
}

// 渲染视频列表
// 渲染视频列表
function renderVideoList() {
    const videoList = document.getElementById('videoList');
    videoList.innerHTML = '';  // 清空现有的视频列表
  
    let filteredVideos = videos.filter(video => {
      const matchesRating = currentRating === 'all' || video.rating === currentRating;
      const matchesTags = ccselectedTagsArray.length === 0 || ccselectedTagsArray.every(tag => video.tags.includes(tag));
      const matchesSearch = searchQuery === '' || 
        video.title.toLowerCase().includes(searchQuery) || 
        video.description.toLowerCase().includes(searchQuery) || 
        video.protagonist.toLowerCase().includes(searchQuery);
  
      // 根据当前筛选条件进行额外筛选
      if (currentFilter === 'invalid') {
        return !video.videoLink || !video.coverImage;  // 失效视频
      }
      if (currentFilter === 'duplicate') {
        const duplicateTitles = videos.filter(v => v.title === video.title);
        return duplicateTitles.length > 1;
      }
      if (currentFilter === 'noTags') {
        return video.tags.length === 1 && video.tags[0] === '全部';  // 无标签视频
      }
  
      return matchesRating && matchesTags && matchesSearch;
    });
  
    // 如果筛选的是重复视频，需要对重复视频按标题分组
    if (currentFilter === 'duplicate') {
      const groupedVideos = groupDuplicateVideos(filteredVideos);
      renderGroupedVideos(groupedVideos);
    } else {
      // 根据排序条件进行排序
      if (currentSort) {
        if (currentSort === 'random'&& randomnum === 0) {
          filteredVideos.sort(() => Math.random() - 0.5);
          randomnum = 1;
          randomfilteredVideos = filteredVideos;
        } else if (currentSort === 'random'&& randomnum === 1){
            filteredVideos = randomfilteredVideos;
        }else if (currentSort === 'tagsnum'){
            filteredVideos.sort((a, b) => new Date(a.tags.length) - new Date(b.tags.length));
        } else if (currentSort === 'title') {
          filteredVideos.sort((a, b) => a.title.localeCompare(b.title));  // 标题排序
        } else if (currentSort === 'addedTimeAsc') {
          filteredVideos.sort((a, b) => new Date(a.addedTime) - new Date(b.addedTime));  // 导入时间正序
        } else if (currentSort === 'addedTimeDesc') {
          filteredVideos.sort((a, b) => new Date(b.addedTime) - new Date(a.addedTime));  // 导入时间倒序
        }
      }
  
      // 计算当前页面的视频范围
      const startIndex = (currentPage - 1) * videosPerPage;
      const endIndex = Math.min(startIndex + videosPerPage, filteredVideos.length);
  
      // 显示当前页面的视频
      const pageVideos = filteredVideos.slice(startIndex, endIndex);
      pageVideos.forEach((video, index) => {
        const div = document.createElement('div');
        div.classList.add('video-item');
  
        // 标签处理：按字数限制显示标签，最多显示30个字符
        const tagsToDisplay = video.tags.slice(1); // 跳过第一个标签
        let tagsText = '';
        let totalLength = 0;
  
        // 计算标签的总字符长度，直到达到最大限制
        for (let tag of tagsToDisplay) {
          if (totalLength + tag.length > 10) {
            tagsText += '...';
            break;
          }
          if (tagsText) {
            tagsText += ', ';
          }
          tagsText += tag;
          totalLength += tag.length;
        }
  
        div.innerHTML = `
          <div class="video-cover" onclick="switchPage('videoDetail', ${video.id})">
            <img src="${video.coverImage}" alt="${video.title}" />
          </div>
          <h4>${video.title.length > 10 ? video.title.substring(0, 20) + '...' : video.title}</h4>
          <p>${tagsText || '无标签'}</p>
          <p>评分: ${video.rating}</p>
        `;
        videoList.appendChild(div);
      });
    }
  
    // 更新视频数量显示
    document.getElementById('videoCount').innerText = filteredVideos.length;
  
    // 渲染分页按钮
    renderPagination(filteredVideos.length);
  }
  
  // 将重复的视频按标题分组
  function groupDuplicateVideos(videos) {
    const grouped = {};
  
    videos.forEach(video => {
      if (!grouped[video.title]) {
        grouped[video.title] = [];
      }
      grouped[video.title].push(video);
    });
  
    // 只返回重复的视频组
    return Object.values(grouped).filter(group => group.length > 1);
  }
  
  // 渲染重复的视频分组
  function renderGroupedVideos(groupedVideos) {
    const videoList = document.getElementById('videoList');
    groupedVideos.forEach(group => {
      group.forEach((video) => {
        const div = document.createElement('div');
        div.classList.add('video-item');
  
        const tagsToDisplay = video.tags.slice(1); // 跳过第一个标签
        let tagsText = '';
        let totalLength = 0;
  
        // 计算标签的总字符长度，直到达到最大限制
        for (let tag of tagsToDisplay) {
          if (totalLength + tag.length > 10) {
            tagsText += '...';
            break;
          }
          if (tagsText) {
            tagsText += ', ';
          }
          tagsText += tag;
          totalLength += tag.length;
        }
  
        div.innerHTML = `
          <div class="video-cover" onclick="switchPage('videoDetail', ${video.id})">
            <img src="${video.coverImage}" alt="${video.title}" />
          </div>
          <h4>${video.title.length > 10 ? video.title.substring(0, 20) + '...' : video.title}</h4>
          <p>${tagsText || '无标签'}</p>
          <p>评分: ${video.rating}</p>
        `;
        videoList.appendChild(div);
      });
    });
  }
  
  
let videoid = 0;
// 切换页面
function switchPage(page, videoId) {
    //console.log(videoId);
    
    if (page === 'videoDetail') {
        const video = videos.find(v => String(v.id) === String(videoId));

        //console.log(videos); 
        // 调试输出，确保找到对应的视频对象
        //console.log(video);

        if (video) {
            videoid = videoId;
            sessionStorage.setItem(`scrollPosition_${pageId}`, window.scrollY);
            displayVideoDetail(video);
        }
    } else if (page === 'favorites') {
        // 切换到我的收藏页面
        document.getElementById('favoritesSection').style.display = 'block';
        document.getElementById('videoDetailPage').style.display = 'none';
        const savedScrollPosition = sessionStorage.getItem(`scrollPosition_${pageId}`);
  
  if (savedScrollPosition !== null) {
    window.scrollTo(0, savedScrollPosition);
  }
        //window.history.back();
        renderVideoList();
        renderTagsList();
    }
}


// 获取视频数据的函数
function getVideoById(videoId) {
    return videos.find(v => String(v.id) === String(videoId));
}

// // 获取视频数据的函数
// function getVideoById(videoId) {
//     return videos.find(v => String(v.id) === String(videoId));
// }

// 显示视频详情
// 显示视频详情
function displayVideoDetail(video) {
    const detailPage = document.getElementById('videoDetailPage');
    const fileExtension = video.playLink.split('.').pop().toLowerCase();
    let mediaElement = '';

    // 根据链接类型显示视频或图片
    if (fileExtension === 'mp4') {
        mediaElement = `
            <div class="video-player">
                <video id="videoPlayer" width="100%" controls>
                    <source src="${video.playLink}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            </div>
        `;
    } else if (fileExtension === 'm3u8') {
        // 使用 HLS.js 播放 .m3u8 视频流
        //console.log(video.playLink);
        mediaElement = `
            <div class="video-player">
                <video id="videoPlayer" width="100%" controls></video>
            </div>
        `;
    } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
        mediaElement = `
            <div class="image-player">
                <img src="${video.playLink}" alt="${video.title}" width="100%">
            </div>
        `;
    }else{
        console.log(video.playLink);
    }
    console.log(video);
    // 显示视频详情页面内容
    detailPage.innerHTML = `
        <div class="video-detail">
            
            ${mediaElement}
            <p><strong>标题:</strong> ${video.title}</p> 
            <p><strong>简介:</strong> ${video.description}</p> 
            <p><strong>主演:</strong> ${video.protagonist}</p>
            <p><strong>标签:</strong> ${video.tags.join(', ')}</p>
            <p><strong>评分:</strong> ${video.rating}</p>
            <p><strong>评价:</strong> ${video.ratetext ? video.ratetext : '无'}</p> <!-- 显示评价，若没有则显示'无' -->

            <!-- 评价输入框 -->
            <div class="rating-input">
                
                <textarea id="ratingInput" placeholder="输入您的评价..." rows="4">${video.ratetext ? video.ratetext : ''}</textarea>
            </div>

            <div class="video-actions">
                <button onclick="window.open('${video.videoLink}', '_blank')">跳转原网页</button>



                <button onclick="openEditForm(${video.id})">编辑</button>
                <button onclick="deleteVideo(${video.id})">删除</button>
                <button onclick="switchPage('favorites')">退出</button>
                <!-- 提交按钮 -->
                <button onclick="submitRating(${video.id})">提交评价</button>
            </div>
        </div>
    `;

    // 如果是 m3u8 视频格式，使用 hls.js 播放
    if (fileExtension === 'm3u8' && Hls.isSupported()) {
        const videoElement = document.getElementById('videoPlayer');
        console.log('HLS is supported, initializing player...');
        const hls = new Hls();
        hls.loadSource(video.playLink);
        hls.attachMedia(videoElement);

        hls.on(Hls.Events.ERROR, function(event, data) {
            console.error('HLS.js error:', data);
        });
    } else if (fileExtension === 'm3u8') {
        console.error('Your browser does not support HLS playback.');
        alert('Your browser does not support HLS playback.');
    }

    // 显示视频详情页面，隐藏其他页面（例如视频列表页面）
    
    document.getElementById('favoritesSection').style.display = 'none';
    detailPage.style.display = 'block';
}

// 提交评价更新
function submitRating(videoId) {
    const ratingInput = document.getElementById('ratingInput').value;

    if (!ratingInput.trim()) {
        showMessage("评价不能为空！");
        return;
    }

    // 获取视频数据
    const video = getVideoById(videoId);

    // 更新视频的评价
    video.ratetext = ratingInput;

    // 将更新后的数据保存回浏览器的localStorage或其他存储方式
    videosaveToLocalStorage() ;

    // 提示用户评价已成功更新
    showMessage("评价已成功提交!");

    // 清空输入框
    document.getElementById('ratingInput').value = '';

    // 更新页面显示的评价
    displayVideoDetail(video);
}


//编辑视频信息
// 显示编辑表单并填充数据
// 打开编辑表单并填充数据
function openEditForm(videoId) {
    const video = getVideoById(videoId);
    console.log(video);
    if (video) {
        // 显示编辑表单并填充数据
        document.getElementById('editForm').style.display = 'block';
        document.getElementById('videoDetailPage').style.display = 'none';
        document.getElementById('exitVideoLink').value = video.videoLink;
        document.getElementById('exitPlayLink').value = video.playLink;
        document.getElementById('exitCoverImage').value = video.coverImage;
        document.getElementById('exitTitle').value = video.title;
        document.getElementById('exitDescription').value = video.description;
        document.getElementById('exitProtagonist').value = video.protagonist;
        document.getElementById('exitRating').value = video.rating;
        document.getElementById('editVideoId').value = video.id;

        // 更新标签显示
        exitsearchTagsArray = tagsArray;
        exitupdateTagSelect(video.tags);  // 传递视频的标签来初始化复选框的状态
    }
}
function exitupdateBeforeSelectedTags(tag, isChecked) {
    if (isChecked) {
        // 如果复选框被选中，则将标签添加到 selectedTagsBeforeSearch 中
        if (!exitselectedTagsBeforeSearch.includes(tag)) {
            exitselectedTagsBeforeSearch.push(tag);
        }
    } else {
        // 如果复选框被取消选中，则从 selectedTagsBeforeSearch 中移除标签
        exitselectedTagsBeforeSearch = exitselectedTagsBeforeSearch.filter(t => t !== tag);
    }
    
}

let exitselectedTagsBeforeSearch = [];
// 更新标签选择框的显示内容
function exitupdateTagSelect(selectedTags) {
    const tagsContainer = document.getElementById('exitTags'); // 获取显示标签的容器
    tagsContainer.innerHTML = ''; // 清空现有选项，以便重新渲染标签
    selectedTags.forEach(tag =>{
        exitupdateBeforeSelectedTags(tag, true);
    });
   
    // 排序标签数组
    const sortedTagsArray = sortTags(exitsearchTagsArray);

    // 遍历排序后的 tagsArray 数组中的所有标签
    sortedTagsArray.forEach(tag => {
        // 创建一个 label 元素，用来包装复选框和标签文本
        const label = document.createElement('label');
        
        // 创建一个复选框元素
        const checkbox = document.createElement('input');
        checkbox.type = "checkbox"; // 设置为复选框类型
        checkbox.value = tag; // 设置复选框的值为当前标签
        checkbox.id = 'exit' + tag; // 设置复选框的 id 为标签的名称

        // 如果是 "全部" 标签，则默认选中并禁用
        if (tag === "全部") {
            checkbox.checked = true; // "全部" 标签默认选中
            checkbox.disabled = true; // 禁用 "全部" 标签的复选框
            exitupdateBeforeSelectedTags(tag, checkbox.checked);
        } else {
            checkbox.checked = exitselectedTagsBeforeSearch.includes(tag); // 判断该标签是否已被选中
        }
                // 为复选框添加点击事件，触发标签选择更新
        checkbox.onclick = function () {
             // 每次点击复选框时，更新已选择标签的显示
            // 在更新标签前，保存当前选中的标签
            exitupdateBeforeSelectedTags(tag, checkbox.checked);
            
        };


        // 将复选框和标签文本追加到 label 元素中
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(tag)); // 创建一个文本节点并将标签名添加到 label 中

        // 将 label 元素添加到标签容器
        tagsContainer.appendChild(label);
    });
}


// 添加新标签
function exitaddTag() {
    const newTag = document.getElementById('exitnewTag').value.trim(); // 获取用户输入的标签，并去除多余的空白字符
    const video = getVideoById(videoid);
    // 如果标签非空且不重复，则添加到标签数组
    if (newTag && !tagsArray.includes(newTag)) {
        tagsArray.push(newTag); // 将新标签添加到 tagsArray 中
        exitsearchTagsArray = tagsArray;
        exitupdateTagSelect(video.tags); // 更新标签选择框，重新渲染标签列表

        // 将更新后的标签数组保存到本地存储
        localStorage.setItem('tagsArray', JSON.stringify(tagsArray));
    } else {
        showMessage('标签不能为空或已存在！'); // 如果标签为空或已存在，则提示用户
    }

    document.getElementById('exitnewTag').value = ''; // 清空输入框
}
let exitsearchTagsArray = tagsArray;
// 搜索标签函数
function exitsearchTags() {
    const searchTerm = document.getElementById('exitnewTag').value.trim(); // 获取搜索词并去除前后空格
    const video = getVideoById(videoid);
    if (searchTerm === '') {
        exitsearchTagsArray = tagsArray; // 如果搜索框为空，显示所有标签
    } else {
        exitsearchTagsArray = tagsArray.filter(tag => {
            // 将标签和搜索词都转换为小写进行匹配，忽略大小写
            const lowerSearchTerm = searchTerm.toLowerCase();
            
            // 获取标签的拼音首字母（提取拼音首字母）
            const pinyinFirstLetter = getPinyinFirstLetter(tag).toLowerCase();
            
            // 判断搜索词是否匹配标签的拼音首字母或标签名称
            return tag.toLowerCase().includes(lowerSearchTerm) || pinyinFirstLetter.includes(lowerSearchTerm);
        
        });
    }
    exitupdateTagSelect(video.tags); // 更新标签显示
    document.getElementById('exitnewTag').value = ''; // 清空输入框
}
document.getElementById('exitnewTag').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        exitsearchTags(); // 按下 Enter 键时调用搜索函数
    }
});
// 保存编辑后的视频信息
function saveEditedVideo() {
    const videoId = document.getElementById('editVideoId').value;
    const video = getVideoById(videoId);
    if (video) {
        video.videoLink = document.getElementById('exitVideoLink').value;
        video.playLink = document.getElementById('exitPlayLink').value;
        video.coverImage = document.getElementById('exitCoverImage').value;
        video.title = document.getElementById('exitTitle').value;
        video.description = document.getElementById('exitDescription').value;
        video.protagonist = document.getElementById('exitProtagonist').value;
        video.tags = exitselectedTagsBeforeSearch;
        video.rating = parseInt(document.getElementById('exitRating').value);
        exitselectedTagsBeforeSearch = [];
        // 更新本地存储
        videosaveToLocalStorage() ;
        showMessage('视频信息已更新！');
        closeEditForm();
        displayVideoDetail(video);
        renderVideoList(); // 更新视频列表
    }
}

// 关闭编辑表单
function closeEditForm() {
    exitselectedTagsBeforeSearch = [];
    document.getElementById('editForm').style.display = 'none';
    document.getElementById('videoDetailPage').style.display = 'block';
}


// 删除视频
function deleteVideo(videoId) {
    const videoIndex = videos.findIndex(v => String(v.id) === String(videoId));
    if (videoIndex > -1) {
        // 弹出确认删除提示框
        showConfirmMessage(`是否确认删除视频？`, function() {
            // 删除视频
            videos.splice(videoIndex, 1);
            videosaveToLocalStorage(); // 更新本地存储
            showMessage('视频已删除！');
            switchPage('favorites');  // 返回视频列表页面
            renderVideoList();  // 更新视频列表
        });
    } else {
        showMessage('视频不存在！'); // 提示视频不存在
    }
}

