let currentPage = 'index';
let previousPage = '';
let currentCategoryId = null;
let currentItemId = null;

let appData = {
  items: [],
  categories: [],
  colors: [],
  sizes: [],
  icons: ['📱', '👕', '📚', '🍎', '🔧', '📦', '🎨', '🧸', '💊', '🚗', '⚽', '🎵', '💄', '🐱', '🌱', '💡'],
  categoryColors: ['#4A90E2', '#7B68EE', '#50C878', '#FF6B6B', '#FFA500', '#95A5A6', '#E74C3C', '#9B59B6', '#3498DB', '#1ABC9C', '#F39C12', '#E67E22']
};

let filterData = {
  searchText: '',
  activeCategory: 0,
  activeColor: '',
  activeSize: '',
  sortBy: 'createTime',
  sortOrder: 'desc'
};

let addFormData = {
  name: '',
  categoryId: null,
  categoryName: '',
  categoryIcon: '',
  color: '',
  colorName: '',
  size: '',
  sizeName: '',
  description: '',
  tags: [],
  tagInput: '',
  image: ''
};

let editingCategory = null;

function initStorage() {
  if (!localStorage.getItem('categories')) {
    const defaultCategories = [
      { id: 1, name: '电子产品', icon: '📱', color: '#4A90E2' },
      { id: 2, name: '衣物', icon: '👕', color: '#7B68EE' },
      { id: 3, name: '书籍', icon: '📚', color: '#50C878' },
      { id: 4, name: '食品', icon: '🍎', color: '#FF6B6B' },
      { id: 5, name: '工具', icon: '🔧', color: '#FFA500' },
      { id: 6, name: '其他', icon: '📦', color: '#95A5A6' }
    ];
    localStorage.setItem('categories', JSON.stringify(defaultCategories));
  }

  if (!localStorage.getItem('items')) {
    localStorage.setItem('items', JSON.stringify([]));
  }

  if (!localStorage.getItem('colors')) {
    const defaultColors = [
      { name: '红色', value: '#FF0000' },
      { name: '蓝色', value: '#0000FF' },
      { name: '绿色', value: '#00FF00' },
      { name: '黄色', value: '#FFFF00' },
      { name: '白色', value: '#FFFFFF' },
      { name: '黑色', value: '#000000' },
      { name: '橙色', value: '#FFA500' },
      { name: '紫色', value: '#800080' },
      { name: '粉色', value: '#FFC0CB' },
      { name: '灰色', value: '#808080' }
    ];
    localStorage.setItem('colors', JSON.stringify(defaultColors));
  }

  if (!localStorage.getItem('sizes')) {
    const defaultSizes = [
      { name: '极小', value: 'xs' },
      { name: '小', value: 's' },
      { name: '中', value: 'm' },
      { name: '大', value: 'l' },
      { name: '极大', value: 'xl' }
    ];
    localStorage.setItem('sizes', JSON.stringify(defaultSizes));
  }
}

function loadData() {
  appData.items = JSON.parse(localStorage.getItem('items') || '[]');
  appData.categories = JSON.parse(localStorage.getItem('categories') || '[]');
  appData.colors = JSON.parse(localStorage.getItem('colors') || '[]');
  appData.sizes = JSON.parse(localStorage.getItem('sizes') || '[]');
}

function showToast(title, icon = 'none') {
  const toast = document.getElementById('toast');
  toast.textContent = title;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2000);
}

function showModal(title, content, onConfirm) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.style.display = 'block';
  
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">${title}</div>
      <div class="modal-body" style="text-align:center;padding:20px;">${content}</div>
      <div class="modal-footer">
        <div class="btn-secondary" onclick="closeCustomModal()">取消</div>
        <div class="btn-primary" onclick="confirmCustomModal()">确定</div>
      </div>
    </div>
  `;
  
  document.getElementById('app').appendChild(overlay);
  document.getElementById('app').appendChild(modal);
  
  window.confirmCustomModal = function() {
    onConfirm();
    closeCustomModal();
  };
  
  window.closeCustomModal = function() {
    overlay.remove();
    modal.remove();
    delete window.confirmCustomModal;
    delete window.closeCustomModal;
  };
  
  overlay.onclick = closeCustomModal;
}

function switchTab(pageId) {
  currentPage = pageId;
  previousPage = '';
  document.getElementById('navbarBack').style.display = 'none';
  
  document.querySelectorAll('.tab-item').forEach(item => item.classList.remove('active'));
  document.querySelector(`.tab-item[onclick="switchTab('${pageId}')"]`).classList.add('active');
  
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  document.getElementById(`page-${pageId}`).classList.add('active');
  
  if (pageId === 'index') {
    document.getElementById('navbarTitle').textContent = '智能物品分类';
    loadIndexPage();
  } else if (pageId === 'classify') {
    document.getElementById('navbarTitle').textContent = '分类管理';
    loadClassifyPage();
  }
}

function navigateTo(pageId, params = {}) {
  previousPage = currentPage;
  currentPage = pageId;
  
  if (params.categoryId) {
    currentCategoryId = params.categoryId;
  }
  if (params.id) {
    currentItemId = params.id;
  }
  
  document.getElementById('navbarBack').style.display = 'block';
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  document.getElementById(`page-${pageId}`).classList.add('active');
  
  if (pageId === 'add') {
    document.getElementById('navbarTitle').textContent = '添加物品';
    loadAddPage(params);
  } else if (pageId === 'detail') {
    document.getElementById('navbarTitle').textContent = '物品详情';
    loadDetailPage();
  } else if (pageId === 'category') {
    loadCategoryPage();
  }
}

function goBack() {
  const newPage = previousPage || 'index';
  switchTab(newPage);
}

function loadIndexPage() {
  renderCategoryNav();
  renderFilterOptions();
  renderItemsList();
}

function renderCategoryNav() {
  const container = document.getElementById('categoryNavItems');
  container.innerHTML = '';
  
  appData.categories.forEach(cat => {
    const div = document.createElement('div');
    div.className = 'category-item';
    div.dataset.id = cat.id;
    div.textContent = cat.icon + ' ' + cat.name;
    div.onclick = () => selectCategory(cat.id);
    container.appendChild(div);
  });
}

function renderFilterOptions() {
  const colorContainer = document.getElementById('colorFilterOptions');
  colorContainer.innerHTML = '';
  
  appData.colors.forEach(c => {
    const div = document.createElement('div');
    div.className = 'color-option';
    div.style.backgroundColor = c.value;
    if (c.value === '#FFFFFF') {
      div.style.border = '1px solid #ddd';
    }
    div.dataset.color = c.value;
    div.onclick = () => selectFilterColor(c.value);
    colorContainer.appendChild(div);
  });
  
  const sizeContainer = document.getElementById('sizeFilterOptions');
  sizeContainer.innerHTML = '';
  
  appData.sizes.forEach(s => {
    const div = document.createElement('div');
    div.className = 'size-option';
    div.textContent = s.name;
    div.dataset.size = s.value;
    div.onclick = () => selectFilterSize(s.value);
    sizeContainer.appendChild(div);
  });
}

function selectCategory(id) {
  filterData.activeCategory = id;
  
  document.querySelectorAll('.category-item').forEach(item => item.classList.remove('active'));
  document.querySelector(`.category-item[data-id="${id}"]`)?.classList.add('active');
  
  renderItemsList();
}

function selectFilterColor(color) {
  filterData.activeColor = filterData.activeColor === color ? '' : color;
  
  document.querySelectorAll('#colorFilterOptions .color-option').forEach(opt => opt.classList.remove('active'));
  if (filterData.activeColor) {
    document.querySelector(`#colorFilterOptions .color-option[data-color="${color}"]`)?.classList.add('active');
  }
  
  renderItemsList();
}

function selectFilterSize(size) {
  filterData.activeSize = filterData.activeSize === size ? '' : size;
  
  document.querySelectorAll('#sizeFilterOptions .size-option').forEach(opt => opt.classList.remove('active'));
  if (filterData.activeSize) {
    document.querySelector(`#sizeFilterOptions .size-option[data-size="${size}"]`)?.classList.add('active');
  }
  
  renderItemsList();
}

function handleSearch(text) {
  filterData.searchText = text.toLowerCase();
  document.getElementById('searchClear').style.display = text ? 'block' : 'none';
  renderItemsList();
}

function clearSearch() {
  document.querySelector('.search-input').value = '';
  handleSearch('');
}

function toggleFilter() {
  const panel = document.getElementById('filterPanel');
  const icon = document.getElementById('filterIcon');
  panel.classList.toggle('show');
  icon.textContent = panel.classList.contains('show') ? '▼' : '▶';
}

function handleSortChange(sortBy) {
  if (filterData.sortBy === sortBy) {
    filterData.sortOrder = filterData.sortOrder === 'asc' ? 'desc' : 'asc';
  } else {
    filterData.sortBy = sortBy;
    filterData.sortOrder = 'desc';
  }
  
  document.querySelectorAll('.sort-option').forEach(opt => opt.classList.remove('active'));
  document.querySelector(`.sort-option[data-sort="${sortBy}"]`)?.classList.add('active');
  
  document.getElementById('sortTimeArrow').textContent = filterData.sortBy === 'createTime' ? (filterData.sortOrder === 'asc' ? '↑' : '↓') : '';
  document.getElementById('sortNameArrow').textContent = filterData.sortBy === 'name' ? (filterData.sortOrder === 'asc' ? '↑' : '↓') : '';
  document.getElementById('sortSizeArrow').textContent = filterData.sortBy === 'size' ? (filterData.sortOrder === 'asc' ? '↑' : '↓') : '';
  
  renderItemsList();
}

function resetFilter() {
  filterData.activeColor = '';
  filterData.activeSize = '';
  filterData.sortBy = 'createTime';
  filterData.sortOrder = 'desc';
  
  document.querySelectorAll('#colorFilterOptions .color-option').forEach(opt => opt.classList.remove('active'));
  document.querySelectorAll('#sizeFilterOptions .size-option').forEach(opt => opt.classList.remove('active'));
  
  document.querySelectorAll('.sort-option').forEach(opt => opt.classList.remove('active'));
  document.querySelector('.sort-option[data-sort="createTime"]')?.classList.add('active');
  
  document.getElementById('sortTimeArrow').textContent = '↓';
  document.getElementById('sortNameArrow').textContent = '';
  document.getElementById('sortSizeArrow').textContent = '';
  
  renderItemsList();
}

function renderItemsList() {
  let items = [...appData.items];
  
  if (filterData.searchText) {
    items = items.filter(item =>
      item.name.toLowerCase().includes(filterData.searchText) ||
      (item.description && item.description.toLowerCase().includes(filterData.searchText)) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(filterData.searchText)))
    );
  }
  
  if (filterData.activeCategory !== 0) {
    items = items.filter(item => item.categoryId === filterData.activeCategory);
  }
  
  if (filterData.activeColor) {
    items = items.filter(item => item.color === filterData.activeColor);
  }
  
  if (filterData.activeSize) {
    items = items.filter(item => item.size === filterData.activeSize);
  }
  
  items.sort((a, b) => {
    let valueA, valueB;
    if (filterData.sortBy === 'createTime') {
      valueA = a.createTime;
      valueB = b.createTime;
    } else if (filterData.sortBy === 'name') {
      valueA = a.name;
      valueB = b.name;
    } else if (filterData.sortBy === 'size') {
      const sizeOrder = { 'xs': 1, 's': 2, 'm': 3, 'l': 4, 'xl': 5 };
      valueA = sizeOrder[a.size] || 3;
      valueB = sizeOrder[b.size] || 3;
    }
    
    if (filterData.sortOrder === 'asc') {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });
  
  const container = document.getElementById('itemsList');
  const emptyState = document.getElementById('emptyState');
  
  if (items.length === 0) {
    container.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }
  
  emptyState.style.display = 'none';
  container.innerHTML = '';
  
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.dataset.id = item.id;
    card.onclick = () => goToDetail(item.id);
    
    const imageHtml = item.image
      ? `<img src="${item.image}" class="preview-img">`
      : `<span class="item-icon">${item.categoryIcon || '📦'}</span>`;
    
    let tagsHtml = '';
    if (item.categoryName) {
      tagsHtml += `<span class="tag category-tag">${item.categoryName}</span>`;
    }
    if (item.colorName) {
      tagsHtml += `<span class="tag color-tag">${item.colorName}</span>`;
    }
    if (item.sizeName) {
      tagsHtml += `<span class="tag size-tag">${item.sizeName}</span>`;
    }
    
    let featureTagsHtml = '';
    if (item.tags && item.tags.length > 0) {
      featureTagsHtml = `<div class="item-tags">${item.tags.map(tag => `<span class="tag feature-tag">${tag}</span>`).join('')}</div>`;
    }
    
    card.innerHTML = `
      <div class="item-image">${imageHtml}</div>
      <div class="item-info">
        <div class="item-name">${item.name}</div>
        ${item.description ? `<div class="item-desc">${item.description}</div>` : ''}
        <div class="item-tags">${tagsHtml}</div>
        ${featureTagsHtml}
      </div>
      <div class="item-arrow">›</div>
    `;
    
    container.appendChild(card);
  });
}

function goToAdd() {
  navigateTo('add');
}

function goToAddWithCategory() {
  navigateTo('add', { categoryId: currentCategoryId });
}

function goToDetail(id) {
  navigateTo('detail', { id });
}

function loadAddPage(params = {}) {
  addFormData = {
    name: '',
    categoryId: params.categoryId || null,
    categoryName: '',
    categoryIcon: '',
    color: '',
    colorName: '',
    size: '',
    sizeName: '',
    description: '',
    tags: [],
    tagInput: '',
    image: ''
  };
  
  document.getElementById('addName').value = '';
  document.getElementById('addDescription').value = '';
  document.getElementById('addTagInput').value = '';
  document.getElementById('addTagsWrap').innerHTML = '';
  
  document.getElementById('imageUploadBtn').style.display = 'flex';
  document.getElementById('imagePreview').style.display = 'none';
  document.getElementById('previewImg').src = '';
  
  if (addFormData.categoryId) {
    const category = appData.categories.find(c => c.id === addFormData.categoryId);
    if (category) {
      addFormData.categoryName = category.name;
      addFormData.categoryIcon = category.icon;
      document.getElementById('addCategoryName').textContent = category.name;
      document.getElementById('addCategoryName').classList.remove('placeholder');
    }
  } else {
    document.getElementById('addCategoryName').textContent = '请选择分类';
    document.getElementById('addCategoryName').classList.add('placeholder');
  }
  
  document.getElementById('addSizeName').textContent = '请选择尺寸';
  document.getElementById('addSizeName').classList.add('placeholder');
  
  renderAddColorOptions();
}

function renderAddColorOptions() {
  const container = document.getElementById('addColorOptions');
  container.innerHTML = '';
  
  appData.colors.forEach(c => {
    const div = document.createElement('div');
    div.className = `color-option ${addFormData.color === c.value ? 'active' : ''}`;
    div.style.backgroundColor = c.value;
    if (c.value === '#FFFFFF') {
      div.style.border = '1px solid #ddd';
    }
    div.dataset.color = c.value;
    div.onclick = () => selectAddColor(c.value);
    if (addFormData.color === c.value) {
      div.innerHTML = '<span class="color-check">✓</span>';
    }
    container.appendChild(div);
  });
}

function selectAddColor(color) {
  const colorObj = appData.colors.find(c => c.value === color);
  addFormData.color = color;
  addFormData.colorName = colorObj ? colorObj.name : '';
  renderAddColorOptions();
}

function showCategoryPicker() {
  const modal = document.getElementById('categoryModal');
  const list = document.getElementById('categoryModalList');
  const overlay = document.getElementById('modalOverlay');
  
  list.innerHTML = '';
  appData.categories.forEach(cat => {
    const div = document.createElement('div');
    div.className = 'picker-item';
    div.textContent = cat.icon + ' ' + cat.name;
    div.onclick = () => {
      addFormData.categoryId = cat.id;
      addFormData.categoryName = cat.name;
      addFormData.categoryIcon = cat.icon;
      document.getElementById('addCategoryName').textContent = cat.name;
      document.getElementById('addCategoryName').classList.remove('placeholder');
      closeModal();
    };
    list.appendChild(div);
  });
  
  overlay.style.display = 'block';
  modal.style.display = 'block';
}

function showSizePicker() {
  const modal = document.getElementById('sizeModal');
  const list = document.getElementById('sizeModalList');
  const overlay = document.getElementById('modalOverlay');
  
  list.innerHTML = '';
  appData.sizes.forEach(size => {
    const div = document.createElement('div');
    div.className = 'picker-item';
    div.textContent = size.name;
    div.onclick = () => {
      addFormData.size = size.value;
      addFormData.sizeName = size.name;
      document.getElementById('addSizeName').textContent = size.name;
      document.getElementById('addSizeName').classList.remove('placeholder');
      closeModal();
    };
    list.appendChild(div);
  });
  
  overlay.style.display = 'block';
  modal.style.display = 'block';
}

function closeModal() {
  document.getElementById('modalOverlay').style.display = 'none';
  document.getElementById('categoryModal').style.display = 'none';
  document.getElementById('sizeModal').style.display = 'none';
  document.getElementById('addCategoryModal').style.display = 'none';
}

function chooseImage() {
  document.getElementById('imageFile').click();
}

function handleImageSelect(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      addFormData.image = e.target.result;
      document.getElementById('imageUploadBtn').style.display = 'none';
      document.getElementById('imagePreview').style.display = 'block';
      document.getElementById('previewImg').src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

function removeImage() {
  addFormData.image = '';
  document.getElementById('imageFile').value = '';
  document.getElementById('imageUploadBtn').style.display = 'flex';
  document.getElementById('imagePreview').style.display = 'none';
  document.getElementById('previewImg').src = '';
}

function addTag() {
  const tag = document.getElementById('addTagInput').value.trim();
  if (tag && !addFormData.tags.includes(tag)) {
    addFormData.tags.push(tag);
    document.getElementById('addTagInput').value = '';
    renderAddTags();
  }
}

function renderAddTags() {
  const container = document.getElementById('addTagsWrap');
  container.innerHTML = '';
  
  addFormData.tags.forEach((tag, index) => {
    const div = document.createElement('div');
    div.className = 'tag-item';
    div.innerHTML = `<span>${tag}</span><span class="tag-remove" onclick="removeAddTag(${index})">×</span>`;
    container.appendChild(div);
  });
}

function removeAddTag(index) {
  addFormData.tags.splice(index, 1);
  renderAddTags();
}

function saveItem() {
  const name = document.getElementById('addName').value.trim();
  const description = document.getElementById('addDescription').value.trim();
  
  if (!name) {
    showToast('请输入物品名称');
    return;
  }
  
  if (!addFormData.categoryId) {
    showToast('请选择物品分类');
    return;
  }
  
  const newItem = {
    id: Date.now(),
    name: name,
    categoryId: addFormData.categoryId,
    categoryName: addFormData.categoryName,
    categoryIcon: addFormData.categoryIcon,
    color: addFormData.color,
    colorName: addFormData.colorName,
    size: addFormData.size,
    sizeName: addFormData.sizeName,
    description: description,
    tags: [...addFormData.tags],
    image: addFormData.image,
    createTime: Date.now(),
    updateTime: Date.now()
  };
  
  appData.items.unshift(newItem);
  localStorage.setItem('items', JSON.stringify(appData.items));
  
  showToast('添加成功');
  setTimeout(() => {
    goBack();
  }, 1500);
}

function loadClassifyPage() {
  renderCategoryList();
}

function renderCategoryList() {
  const container = document.getElementById('categoryList');
  const emptyState = document.getElementById('classifyEmptyState');
  
  if (appData.categories.length === 0) {
    container.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }
  
  emptyState.style.display = 'none';
  container.innerHTML = '';
  
  appData.categories.forEach(cat => {
    const count = appData.items.filter(item => item.categoryId === cat.id).length;
    
    const card = document.createElement('div');
    card.className = 'category-card';
    card.innerHTML = `
      <div class="category-card-icon" style="background-color: ${cat.color}">${cat.icon}</div>
      <div class="category-card-info">
        <div class="category-card-name">${cat.name}</div>
        <div class="category-card-count">${count} 个物品</div>
      </div>
      <div class="category-card-actions">
        <div class="category-action-btn edit" onclick="editCategory(${cat.id})">编辑</div>
        <div class="category-action-btn view" onclick="viewCategoryItems(${cat.id})">查看</div>
        <div class="category-action-btn delete" onclick="deleteCategory(${cat.id})">删除</div>
      </div>
    `;
    
    container.appendChild(card);
  });
}

function showAddCategoryModal() {
  editingCategory = null;
  document.getElementById('categoryNameInput').value = '';
  renderIconOptions();
  renderCategoryColorOptions();
  
  const overlay = document.getElementById('modalOverlay');
  const modal = document.getElementById('addCategoryModal');
  overlay.style.display = 'block';
  modal.style.display = 'block';
}

function editCategory(id) {
  editingCategory = appData.categories.find(c => c.id === id);
  if (editingCategory) {
    document.getElementById('categoryNameInput').value = editingCategory.name;
    renderIconOptions(editingCategory.icon);
    renderCategoryColorOptions(editingCategory.color);
    
    const overlay = document.getElementById('modalOverlay');
    const modal = document.getElementById('addCategoryModal');
    overlay.style.display = 'block';
    modal.style.display = 'block';
  }
}

function renderIconOptions(selectedIcon = '') {
  const container = document.getElementById('iconOptions');
  container.innerHTML = '';
  
  appData.icons.forEach(icon => {
    const div = document.createElement('div');
    div.className = `icon-option ${selectedIcon === icon ? 'active' : ''}`;
    div.textContent = icon;
    div.onclick = () => {
      document.querySelectorAll('.icon-option').forEach(opt => opt.classList.remove('active'));
      div.classList.add('active');
      if (editingCategory) editingCategory.icon = icon;
    };
    container.appendChild(div);
  });
}

function renderCategoryColorOptions(selectedColor = '') {
  const container = document.getElementById('categoryColorOptions');
  container.innerHTML = '';
  
  appData.categoryColors.forEach(color => {
    const div = document.createElement('div');
    div.className = `color-option ${selectedColor === color ? 'active' : ''}`;
    div.style.backgroundColor = color;
    div.onclick = () => {
      document.querySelectorAll('#categoryColorOptions .color-option').forEach(opt => opt.classList.remove('active'));
      div.classList.add('active');
      if (editingCategory) editingCategory.color = color;
    };
    if (selectedColor === color) {
      div.innerHTML = '<span class="color-check">✓</span>';
    }
    container.appendChild(div);
  });
}

function closeAddCategoryModal() {
  closeModal();
  editingCategory = null;
}

function saveCategory() {
  const name = document.getElementById('categoryNameInput').value.trim();
  if (!name) {
    showToast('请输入分类名称');
    return;
  }
  
  const activeIcon = document.querySelector('#iconOptions .icon-option.active');
  const activeColor = document.querySelector('#categoryColorOptions .color-option.active');
  
  if (editingCategory) {
    editingCategory.name = name;
    editingCategory.icon = activeIcon.textContent;
    editingCategory.color = activeColor.style.backgroundColor;
  } else {
    const newCategory = {
      id: Date.now(),
      name: name,
      icon: activeIcon.textContent,
      color: activeColor.style.backgroundColor
    };
    appData.categories.push(newCategory);
  }
  
  localStorage.setItem('categories', JSON.stringify(appData.categories));
  loadData();
  
  showToast(editingCategory ? '修改成功' : '添加成功');
  closeAddCategoryModal();
  loadClassifyPage();
}

function deleteCategory(id) {
  const category = appData.categories.find(c => c.id === id);
  const count = appData.items.filter(item => item.categoryId === id).length;
  
  if (count > 0) {
    showToast(`该分类下还有 ${count} 个物品，请先移动物品或删除物品后再删除分类`);
    return;
  }
  
  showModal('确认删除', `确定要删除分类"${category.name}"吗？`, () => {
    appData.categories = appData.categories.filter(c => c.id !== id);
    localStorage.setItem('categories', JSON.stringify(appData.categories));
    loadData();
    showToast('删除成功');
    loadClassifyPage();
  });
}

function viewCategoryItems(id) {
  navigateTo('category', { categoryId: id });
}

function loadCategoryPage() {
  const category = appData.categories.find(c => c.id === currentCategoryId);
  if (!category) {
    goBack();
    return;
  }
  
  document.getElementById('navbarTitle').textContent = category.name;
  
  const header = document.getElementById('categoryHeader');
  const items = appData.items.filter(item => item.categoryId === currentCategoryId);
  
  header.innerHTML = `
    <div class="category-icon" style="background-color: ${category.color}">${category.icon}</div>
    <div class="category-info">
      <div class="category-name">${category.name}</div>
      <div class="category-count">共 ${items.length} 个物品</div>
    </div>
    <div class="sort-btn" onclick="toggleCategorySort()">${sortBy === 'createTime' ? '时间' : '名称'} ${sortOrder === 'asc' ? '↑' : '↓'}</div>
  `;
  
  const container = document.getElementById('categoryItemsList');
  const emptyState = document.getElementById('categoryEmptyState');
  
  if (items.length === 0) {
    container.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }
  
  emptyState.style.display = 'none';
  container.innerHTML = '';
  
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.dataset.id = item.id;
    card.onclick = () => goToDetail(item.id);
    
    const imageHtml = item.image
      ? `<img src="${item.image}" class="preview-img">`
      : `<span class="item-icon">${item.categoryIcon || '📦'}</span>`;
    
    let tagsHtml = '';
    if (item.colorName) {
      tagsHtml += `<span class="tag color-tag">${item.colorName}</span>`;
    }
    if (item.sizeName) {
      tagsHtml += `<span class="tag size-tag">${item.sizeName}</span>`;
    }
    
    card.innerHTML = `
      <div class="item-image">${imageHtml}</div>
      <div class="item-info">
        <div class="item-name">${item.name}</div>
        ${item.description ? `<div class="item-desc">${item.description}</div>` : ''}
        <div class="item-tags">${tagsHtml}</div>
      </div>
      <div class="item-arrow">›</div>
    `;
    
    container.appendChild(card);
  });
}

let categorySortBy = 'createTime';
let categorySortOrder = 'desc';

function toggleCategorySort() {
  if (categorySortBy === 'createTime') {
    categorySortBy = 'name';
    categorySortOrder = 'asc';
  } else {
    if (categorySortOrder === 'asc') {
      categorySortOrder = 'desc';
    } else {
      categorySortOrder = 'asc';
    }
  }
  loadCategoryPage();
}

function loadDetailPage() {
  const item = appData.items.find(i => i.id === currentItemId);
  if (!item) {
    showToast('物品不存在');
    setTimeout(() => goBack(), 1500);
    return;
  }
  
  const container = document.getElementById('detailContainer');
  container.innerHTML = '';
  
  const imageHtml = item.image
    ? `<div class="item-image" onclick="previewImage('${item.image}')">
         <img src="${item.image}">
       </div>`
    : `<div class="no-image">
         <span class="no-image-icon">${item.categoryIcon || '📦'}</span>
       </div>`;
  
  const colorOptions = appData.colors.map(c => {
    const active = item.color === c.value ? 'active' : '';
    return `<div class="color-dot ${active}" style="background-color: ${c.value}; ${c.value === '#FFFFFF' ? 'border: 1px solid #ddd;' : ''}" onclick="selectDetailColor('${c.value}')"></div>`;
  }).join('');
  
  const colorDisplay = item.color
    ? `<div class="color-display">
         <div class="color-dot" style="background-color: ${item.color}; ${item.color === '#FFFFFF' ? 'border: 1px solid #ddd;' : ''}"></div>
         <span class="info-value">${item.colorName || '未知'}</span>
       </div>`
    : '<span class="info-value">未设置</span>';
  
  const tagsHtml = item.tags && item.tags.length > 0
    ? item.tags.map(tag => `<div class="tag-item"><span>${tag}</span></div>`).join('')
    : '';
  
  container.innerHTML = `
    <div class="card">
      <div class="image-section">${imageHtml}</div>
    </div>
    <div class="card">
      <div class="card-header">
        <span class="card-title">基本信息</span>
      </div>
      <div class="info-item">
        <span class="info-label">名称</span>
        <span class="info-value">${item.name}</span>
      </div>
      <div class="info-item">
        <span class="info-label">分类</span>
        <span class="info-value">${item.categoryName || '未分类'}</span>
      </div>
      <div class="info-item">
        <span class="info-label">颜色</span>
        ${colorDisplay}
      </div>
      <div class="info-item">
        <span class="info-label">尺寸</span>
        <span class="info-value">${item.sizeName || '未设置'}</span>
      </div>
      <div class="info-item">
        <span class="info-label">描述</span>
        <span class="info-value">${item.description || '暂无描述'}</span>
      </div>
    </div>
    <div class="card">
      <div class="card-header">
        <span class="card-title">特征标签</span>
      </div>
      <div class="tags-container">${tagsHtml}</div>
    </div>
    <div class="card">
      <div class="card-header">
        <span class="card-title">时间信息</span>
      </div>
      <div class="info-item">
        <span class="info-label">创建时间</span>
        <span class="info-value">${formatDate(item.createTime)}</span>
      </div>
      <div class="info-item">
        <span class="info-label">更新时间</span>
        <span class="info-value">${formatDate(item.updateTime)}</span>
      </div>
    </div>
    <div class="action-buttons">
      <div class="btn-danger" onclick="deleteItem(${item.id})">删除物品</div>
    </div>
  `;
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

function deleteItem(id) {
  const item = appData.items.find(i => i.id === id);
  showModal('确认删除', `确定要删除物品"${item.name}"吗？`, () => {
    appData.items = appData.items.filter(i => i.id !== id);
    localStorage.setItem('items', JSON.stringify(appData.items));
    showToast('删除成功');
    setTimeout(() => {
      goBack();
    }, 1500);
  });
}

function previewImage(src) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.style.display = 'block';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  
  const img = document.createElement('img');
  img.src = src;
  img.style.maxWidth = '90%';
  img.style.maxHeight = '90%';
  img.style.position = 'absolute';
  img.style.top = '50%';
  img.style.left = '50%';
  img.style.transform = 'translate(-50%, -50%)';
  
  overlay.appendChild(img);
  overlay.onclick = () => overlay.remove();
  
  document.getElementById('app').appendChild(overlay);
}

document.addEventListener('DOMContentLoaded', () => {
  initStorage();
  loadData();
  switchTab('index');
});