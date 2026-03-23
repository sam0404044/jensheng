// 人生製藥 - 前端腳本
document.addEventListener('DOMContentLoaded', function () {
	var navLinks = Array.prototype.slice.call(document.querySelectorAll('.site-nav a[href^="#"]'));
	if (navLinks.length === 0) return;

	var sections = navLinks.map(function (link) {
		var id = link.getAttribute('href').replace('#', '');
		return document.getElementById(id);
	}).filter(Boolean);

	function setActiveByHash(hash) {
		navLinks.forEach(function (link) {
			var isActive = link.getAttribute('href') === hash;
			link.classList.toggle('active', isActive);
		});
	}

	navLinks.forEach(function (link) {
		link.addEventListener('click', function (e) {
			var targetHash = link.getAttribute('href');
			var target = document.getElementById(targetHash.replace('#', ''));
			if (!target) return;
			e.preventDefault();
			target.scrollIntoView({ behavior: 'smooth', block: 'start' });
			if (window.history && window.history.replaceState) {
				window.history.replaceState(null, '', targetHash);
			} else {
				window.location.hash = targetHash;
			}
			setActiveByHash(targetHash);
		});
	});

	function getCurrentSectionHash() {
		var midpoint = window.scrollY + window.innerHeight * 0.35;
		var currentId = 'top';
		sections.forEach(function (section) {
			if (section.offsetTop <= midpoint) currentId = section.id;
		});
		return '#' + currentId;
	}

	var ticking = false;
	function onScroll() {
		if (ticking) return;
		ticking = true;
		window.requestAnimationFrame(function () {
			setActiveByHash(getCurrentSectionHash());
			ticking = false;
		});
	}

	window.addEventListener('scroll', onScroll, { passive: true });
	window.addEventListener('load', onScroll);
	setActiveByHash(window.location.hash && document.getElementById(window.location.hash.slice(1)) ? window.location.hash : '#top');
});
