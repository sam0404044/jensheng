(function () {
	function getProductId() {
		var params = new URLSearchParams(window.location.search);
		return params.get('id') || '';
	}

	function init() {
		var id = getProductId();
		if (!id) {
			document.getElementById('product-detail').innerHTML = '<p class="catalog-empty">未指定產品，請從 <a href="index.html#catalog" class="nav-link">產品目錄</a> 選擇。</p>';
			return;
		}
		fetch('data/products.json')
			.then(function (res) { return res.json(); })
			.then(function (data) {
				var product = (data.products || []).find(function (p) { return p.id === id; });
				if (!product) {
					document.getElementById('product-detail').innerHTML = '<p class="catalog-empty">找不到此產品，請返回 <a href="index.html#catalog" class="nav-link">產品目錄</a>。</p>';
					return;
				}
				renderProduct(product);
				document.title = (product.name + ' - 產品目錄 - 人生製藥');
			})
			.catch(function () {
				document.getElementById('product-detail').innerHTML = '<p class="catalog-empty">無法載入產品資料。</p>';
			});
	}

	function escapeHtml(s) {
		if (s == null || s === '') return '';
		var div = document.createElement('div');
		div.textContent = s;
		return div.innerHTML;
	}

	function renderProduct(p) {
		var block = document.getElementById('product-detail');
		var imgHtml = p.image
			? '<img src="' + escapeHtml(p.image) + '" alt="' + escapeHtml(p.name) + '">'
			: '<div style="padding:2rem;text-align:center;color:#999;">無產品圖片</div>';
		var rows = [
			{ label: '產品名稱', value: p.name },
			{ label: '英文名稱', value: p.nameEn },
			{ label: '類別', value: p.category },
			{ label: '次類別', value: p.subCategory },
			{ label: '劑型', value: p.dosageForm },
			{ label: '功效', value: p.efficacy },
			{ label: '規格', value: p.specs }
		];
		var rowsHtml = rows.filter(function (r) { return r.value; }).map(function (r) {
			return '<div class="detail-row"><strong>' + escapeHtml(r.label) + '：</strong>' + escapeHtml(r.value) + '</div>';
		}).join('');
		var exportHtml = (p.exportInfo && p.exportInfo.trim()) ? '<div class="export-info"><strong>外銷資訊</strong><p>' + escapeHtml(p.exportInfo) + '</p></div>' : '';
		block.innerHTML =
			'<div class="product-detail-block">' +
			'<div class="product-image">' + imgHtml + '</div>' +
			'<div class="product-info">' +
			'<h1>' + escapeHtml(p.name) + (p.nameEn ? ' <span style="font-size:0.75em;color:var(--color-text-muted);font-weight:normal">' + escapeHtml(p.nameEn) + '</span>' : '') + '</h1>' +
			rowsHtml +
			exportHtml +
			'</div></div>';
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
