(function () {
	var products = [];
	var categories = [];
	var currentCategory = '';
	var currentPage = 1;
	var ITEMS_PER_PAGE = 10;
	var PAGE_GROUP_SIZE = 10;

	function bindImageFallback(container) {
		if (!container) return;
		// Event delegation: even if grid re-renders, the handler stays.
		container.addEventListener('error', function (e) {
			var img = e.target;
			if (!img || !img.tagName || img.tagName.toUpperCase() !== 'IMG') return;

			var fallback = document.createElement('div');
			fallback.textContent = '圖片載入失敗';
			fallback.style.height = '160px';
			fallback.style.display = 'flex';
			fallback.style.alignItems = 'center';
			fallback.style.justifyContent = 'center';
			fallback.style.color = '#999';

			img.replaceWith(fallback);
		}, true);
	}

	function init() {
		var grid = document.getElementById('catalog-grid');
		bindImageFallback(grid);

		fetch('data/products.json')
			.then(function (res) { return res.json(); })
			.then(function (data) {
				products = data.products || [];
				categories = data.categories || [];
				currentCategory = getUrlCategory();
				renderTabs();
				bindTabs();
				updateCatalogView();
				bindSearch();
				bindPagination();
			})
			.catch(function () {
				document.getElementById('catalog-grid').innerHTML = '<p class="catalog-empty">無法載入產品資料，請稍後再試。</p>';
			});
	}

	function getUrlCategory() {
		var params = new URLSearchParams(window.location.search);
		return params.get('cat') || '';
	}

	function setUrlCategory(cat) {
		var url = new URL(window.location.href);
		if (cat) url.searchParams.set('cat', cat);
		else url.searchParams.delete('cat');
		url.searchParams.delete('q');
		window.history.replaceState({}, '', url.toString());
	}

	function renderTabs() {
		var container = document.getElementById('catalog-tabs');
		if (!container) return;
		var all = '<button type="button" class="tab' + (!currentCategory ? ' active' : '') + '" data-cat="">全部</button>';
		var tabs = categories.map(function (c) {
			var id = c.id || c.name;
			var isActive = currentCategory === id;
			return '<button type="button" class="tab' + (isActive ? ' active' : '') + '" data-cat="' + escapeHtml(id) + '">' + escapeHtml(c.name) + '</button>';
		}).join('');
		container.innerHTML = all + tabs;
	}

	function bindTabs() {
		var container = document.getElementById('catalog-tabs');
		if (!container) return;
		container.addEventListener('click', function (e) {
			var tab = e.target.closest('.tab[data-cat]');
			if (!tab) return;
			currentCategory = tab.getAttribute('data-cat') || '';
			currentPage = 1;
			setUrlCategory(currentCategory);
			renderTabs();
			updateCatalogView();
		});
	}

	function filterProducts() {
		var q = (document.getElementById('catalog-search') && document.getElementById('catalog-search').value) || '';
		var cat = currentCategory;
		var catObj = categories.find(function (c) { return c.id === cat || c.name === cat; });
		var catName = catObj ? catObj.name : cat;
		return products.filter(function (p) {
			var matchCat = !cat || p.category === catName;
			var matchSearch = !q || [p.name, p.nameEn, p.category, p.subCategory, p.dosageForm, p.efficacy].some(function (s) {
				return s && String(s).toLowerCase().indexOf(q.toLowerCase()) !== -1;
			});
			return matchCat && matchSearch;
		});
	}

	function renderProducts(list, totalCount) {
		var grid = document.getElementById('catalog-grid');
		var countEl = document.getElementById('catalog-count');
		if (!grid) return;
		if (countEl) countEl.textContent = '共 ' + totalCount + ' 項產品';
		if (list.length === 0) {
			grid.innerHTML = '<p class="catalog-empty">找不到符合條件的產品，請試試其他關鍵字或分類。</p>';
			return;
		}
		grid.innerHTML = list.map(function (p) {
			var img = p.image ? '<img src="' + escapeHtml(p.image) + '" alt="' + escapeHtml(p.name) + '" loading="lazy">' : '<div style="height:160px;display:flex;align-items:center;justify-content:center;color:#999;">無圖</div>';
			var meta = [p.category, p.dosageForm].filter(Boolean).join(' · ');
			return '<a href="product-detail.html?id=' + encodeURIComponent(p.id) + '" class="catalog-card">' +
				'<div class="img-wrap">' + img + '</div>' +
				'<div class="info"><p class="name">' + escapeHtml(p.name) + '</p><p class="meta">' + escapeHtml(meta) + '</p></div></a>';
		}).join('');
	}

	function bindSearch() {
		var input = document.getElementById('catalog-search');
		if (!input) return;
		input.addEventListener('input', function () {
			currentPage = 1;
			updateCatalogView();
		});
		input.addEventListener('keyup', function (e) {
			if (e.key === 'Enter') {
				currentPage = 1;
				updateCatalogView();
			}
		});
	}

	function bindPagination() {
		var container = document.getElementById('catalog-pagination');
		if (!container) return;
		container.addEventListener('click', function (e) {
			var btn = e.target.closest('.page-btn[data-page]');
			if (!btn || btn.disabled) return;
			var page = Number(btn.getAttribute('data-page'));
			if (!page || page < 1) return;
			currentPage = page;
			updateCatalogView();
			var section = document.getElementById('catalog');
			if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
		});
	}

	function updateCatalogView() {
		var filtered = filterProducts();
		var totalCount = filtered.length;
		var totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
		if (currentPage > totalPages) currentPage = totalPages;
		if (currentPage < 1) currentPage = 1;
		var start = (currentPage - 1) * ITEMS_PER_PAGE;
		var pagedList = filtered.slice(start, start + ITEMS_PER_PAGE);
		renderProducts(pagedList, totalCount);
		renderPagination(totalPages);
	}

	function renderPagination(totalPages) {
		var container = document.getElementById('catalog-pagination');
		if (!container) return;
		if (totalPages <= 1) {
			container.innerHTML = '<button type="button" class="page-btn active" data-page="1" disabled>1</button>';
			return;
		}
		var groupStart = Math.floor((currentPage - 1) / PAGE_GROUP_SIZE) * PAGE_GROUP_SIZE + 1;
		var groupEnd = Math.min(groupStart + PAGE_GROUP_SIZE - 1, totalPages);
		var html = '';
		if (groupStart > 1) {
			html += '<button type="button" class="page-btn" data-page="1">«</button>';
			html += '<button type="button" class="page-btn" data-page="' + (groupStart - 1) + '">‹</button>';
		}
		for (var p = groupStart; p <= groupEnd; p++) {
			html += '<button type="button" class="page-btn' + (p === currentPage ? ' active' : '') + '" data-page="' + p + '">' + p + '</button>';
		}
		if (groupEnd < totalPages) {
			html += '<button type="button" class="page-btn" data-page="' + (groupEnd + 1) + '">›</button>';
			html += '<button type="button" class="page-btn" data-page="' + totalPages + '">»</button>';
		}
		container.innerHTML = html;
	}

	function escapeHtml(s) {
		if (!s) return '';
		var div = document.createElement('div');
		div.textContent = s;
		return div.innerHTML;
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
