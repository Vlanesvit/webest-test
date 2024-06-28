

class Popup {
	constructor(options = {}) {
		const config = {
			logging: true,
			init: true,
			attributeOpenButton: 'data-popup',
			attributeCloseButton: 'data-close',
			fixElementSelector: '[data-lp]',
			youtubeAttribute: 'data-popup-youtube',
			youtubePlaceAttribute: 'data-popup-youtube-place',
			setAutoplayYoutube: true,
			classes: {
				popup: 'popup',
				popupContent: 'popup__content',
				popupActive: 'popup_show',
				bodyActive: 'popup-show'
			},
			focusCatch: false,
			closeEsc: true,
			bodyLock: true,
			hashSettings: {
				location: true,
				goHash: true
			},
			on: {
				beforeOpen: () => { },
				afterOpen: () => { },
				beforeClose: () => { },
				afterClose: () => { }
			}
		};

		this.options = { ...config, ...options };
		this.options.classes = { ...config.classes, ...options.classes };
		this.options.hashSettings = { ...config.hashSettings, ...options.hashSettings };
		this.options.on = { ...config.on, ...options.on };

		this.youTubeCode = null;
		this.isOpen = false;
		this.targetOpen = { selector: null, element: null };
		this.previousOpen = { selector: null, element: null };
		this.lastClosed = { selector: null, element: null };
		this.lastFocusEl = null;
		this._focusEl = [
			'a[href]',
			'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
			'button:not([disabled]):not([aria-hidden])',
			'select:not([disabled]):not([aria-hidden])',
			'textarea:not([disabled]):not([aria-hidden])',
			'area[href]',
			'iframe',
			'object',
			'embed',
			'[contenteditable]',
			'[tabindex]:not([tabindex^="-"])'
		];

		this.options.init && this.initPopups();
	}

	initPopups() {
		document.addEventListener("click", this.handleDocumentClick.bind(this));
		document.addEventListener("keydown", this.handleDocumentKeydown.bind(this));

		if (this.options.hashSettings.goHash) {
			window.addEventListener('hashchange', this.handleHashChange.bind(this));
			window.addEventListener('load', this.handleHashChange.bind(this));
		}
	}

	handleDocumentClick(e) {
		const buttonOpen = e.target.closest(`[${this.options.attributeOpenButton}]`);
		if (buttonOpen) {
			e.preventDefault();
			this.openPopup(buttonOpen);
		} else {
			const buttonClose = e.target.closest(`[${this.options.attributeCloseButton}]`);
			if (buttonClose || (!e.target.closest(`.${this.options.classes.popupContent}`) && this.isOpen)) {
				e.preventDefault();
				this.close();
			}
		}
	}

	handleDocumentKeydown(e) {
		if (this.options.closeEsc && e.key === 'Escape' && this.isOpen) {
			e.preventDefault();
			this.close();
		}
		if (this.options.focusCatch && e.key === 'Tab' && this.isOpen) {
			this._focusCatch(e);
		}
	}

	handleHashChange() {
		if (window.location.hash) {
			this._openToHash();
		} else {
			this.close(this.targetOpen.selector);
		}
	}

	openPopup(buttonOpen) {
		this._dataValue = buttonOpen.getAttribute(this.options.attributeOpenButton) || 'error';
		this.youTubeCode = buttonOpen.getAttribute(this.options.youtubeAttribute) || null;

		if (this._dataValue !== 'error') {
			if (!this.isOpen) this.lastFocusEl = buttonOpen;
			this.targetOpen.selector = this._dataValue;
			this.open();
		}
	}

	open(selectorValue = null) {
		if (bodyLockStatus) {
			this.bodyLock = document.documentElement.classList.contains('lock') && !this.isOpen;

			if (selectorValue && typeof selectorValue === "string" && selectorValue.trim() !== "") {
				this.targetOpen.selector = selectorValue;
			}

			if (this.isOpen) {
				this._reopen = true;
				this.close();
			}

			if (!this.targetOpen.selector) {
				this.targetOpen.selector = this.lastClosed.selector;
			}

			this.targetOpen.element = document.querySelector(this.targetOpen.selector);

			if (this.targetOpen.element) {
				if (this.youTubeCode) {
					this._embedYouTubeVideo();
				}

				if (this.options.hashSettings.location) {
					this._getHash();
					this._setHash();
				}

				this.options.on.beforeOpen(this);
				document.dispatchEvent(new CustomEvent("beforePopupOpen", { detail: { popup: this } }));

				this.targetOpen.element.classList.add(this.options.classes.popupActive);
				document.documentElement.classList.add(this.options.classes.bodyActive);

				if (!this._reopen) {
					!this.bodyLock ? bodyLock() : null;
				} else {
					this._reopen = false;
				}

				this.targetOpen.element.setAttribute('aria-hidden', 'false');

				this.previousOpen = { ...this.targetOpen };
				this.isOpen = true;

				setTimeout(() => this._focusTrap(), 50);

				this.options.on.afterOpen(this);
				document.dispatchEvent(new CustomEvent("afterPopupOpen", { detail: { popup: this } }));
			}
		}
	}

	close(selectorValue = null) {
		if (selectorValue && typeof selectorValue === "string" && selectorValue.trim() !== "") {
			this.previousOpen.selector = selectorValue;
		}

		if (!this.isOpen || !bodyLockStatus) return;

		this.options.on.beforeClose(this);
		document.dispatchEvent(new CustomEvent("beforePopupClose", { detail: { popup: this } }));

		if (this.youTubeCode) {
			this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`).innerHTML = '';
		}

		this.previousOpen.element.classList.remove(this.options.classes.popupActive);
		this.previousOpen.element.setAttribute('aria-hidden', 'true');

		if (!this._reopen) {
			document.documentElement.classList.remove(this.options.classes.bodyActive);
			!this.bodyLock ? bodyUnlock() : null;
			this.isOpen = false;
		}

		this._removeHash();

		setTimeout(() => this._focusTrap(), 50);

		this.options.on.afterClose(this);
		document.dispatchEvent(new CustomEvent("afterPopupClose", { detail: { popup: this } }));
	}

	_embedYouTubeVideo() {
		const iframe = document.createElement('iframe');
		iframe.setAttribute('allowfullscreen', '');
		const autoplay = this.options.setAutoplayYoutube ? 'autoplay;' : '';
		iframe.setAttribute('allow', `${autoplay} encrypted-media`);
		iframe.setAttribute('src', `https://www.youtube.com/embed/${this.youTubeCode}?rel=0&showinfo=0&autoplay=1`);

		const youtubePlace = this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`);
		if (!youtubePlace) {
			this.targetOpen.element.querySelector('.popup__text').setAttribute(this.options.youtubePlaceAttribute, '');
		}
		this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`).appendChild(iframe);
	}

	_getHash() {
		if (this.options.hashSettings.location) {
			this.hash = this.targetOpen.selector.includes('#') ? this.targetOpen.selector : this.targetOpen.selector.replace('.', '#');
		}
	}

	_openToHash() {
		const classInHash = document.querySelector(`.${window.location.hash.replace('#', '')}`) || document.querySelector(`${window.location.hash}`);
		const buttons = document.querySelector(`[${this.options.attributeOpenButton}="${classInHash}"]`) || document.querySelector(`[${this.options.attributeOpenButton}="${classInHash?.replace('.', "#")}"]`);

		if (buttons && classInHash) {
			this.open(classInHash);
		}
	}

	_setHash() {
		history.pushState('', '', this.hash);
	}

	_removeHash() {
		history.pushState('', '', window.location.href.split('#')[0]);
	}

	_focusCatch(e) {
		const focusable = this.targetOpen.element.querySelectorAll(this._focusEl);
		const focusArray = Array.prototype.slice.call(focusable);
		const focusedIndex = focusArray.indexOf(document.activeElement);

		if (e.shiftKey && focusedIndex === 0) {
			focusArray[focusArray.length - 1].focus();
			e.preventDefault();
		}
		if (!e.shiftKey && focusedIndex === focusArray.length - 1) {
			focusArray[0].focus();
			e.preventDefault();
		}
	}

	_focusTrap() {
		const focusable = this.previousOpen.element.querySelectorAll(this._focusEl);
		if (!this.isOpen && this.lastFocusEl) {
			this.lastFocusEl.focus();
		} else {
			focusable[0].focus();
		}
	}
}
new Popup({});

function fillText() {
	const aboutBtn = document.querySelectorAll('.catalog .catalog__buttons .btn');
	const modal = document.querySelector('.popup');
	aboutBtn.forEach(button => {
		button.addEventListener('click', () => {
			const product = button.closest('.catalog__item');

			const productImgSrc = product.querySelector('.catalog__img img').src;
			const productTitle = product.querySelector('.catalog__desc h4').textContent;
			const productDescription = product.querySelector('.catalog__desc p').textContent;

			const modalImg = modal.querySelector('.popup__text .catalog__img img');
			const modalTitle = modal.querySelector('.popup__text .catalog__desc h4');
			const modalDescription = modal.querySelector('.popup__text .catalog__desc p');

			modalImg.src = productImgSrc;
			modalTitle.textContent = productTitle;
			modalDescription.textContent = productDescription;
		});
	});
}
fillText()

function formQuantity() {
	document.addEventListener("click", function (e) {
		let targetElement = e.target;
		if (targetElement.closest('[data-quantity-plus]') || targetElement.closest('[data-quantity-minus]')) {
			const valueElement = targetElement.closest('[data-quantity]').querySelector('[data-quantity-value]');
			let value = parseInt(valueElement.value);
			if (targetElement.hasAttribute('data-quantity-plus')) {
				value++;
				if (+valueElement.dataset.quantityMax && +valueElement.dataset.quantityMax < value) {
					value = valueElement.dataset.quantityMax;
				}
			} else {
				--value;
				if (+valueElement.dataset.quantityMin) {
					if (+valueElement.dataset.quantityMin > value) {
						value = valueElement.dataset.quantityMin;
					}
				} else if (value < 1) {
					value = 1;
				}
			}
			targetElement.closest('[data-quantity]').querySelector('[data-quantity-value]').value = value;
		}
	});
}
formQuantity()

//========================================================================================================================================================
// Вспомогательные модули блокировки прокрутки
let bodyLockStatus = true;
let bodyLockToggle = (delay = 300) => {
	if (document.documentElement.classList.contains('lock')) {
		bodyUnlock(delay);
	} else {
		bodyLock(delay);
	}
}
let bodyUnlock = (delay = 300) => {
	let body = document.querySelector("body");
	if (bodyLockStatus) {
		let lock_padding = document.querySelectorAll("[data-lp]");
		setTimeout(() => {
			for (let index = 0; index < lock_padding.length; index++) {
				const el = lock_padding[index];
				el.style.paddingRight = '0px';
			}
			body.style.paddingRight = '0px';
			document.documentElement.classList.remove("lock");
		}, delay);
		bodyLockStatus = false;
		setTimeout(function () {
			bodyLockStatus = true;
		}, delay);
	}
}
let bodyLock = (delay = 300) => {
	let body = document.querySelector("body");
	if (bodyLockStatus) {
		let lock_padding = document.querySelectorAll("[data-lp]");
		for (let index = 0; index < lock_padding.length; index++) {
			const el = lock_padding[index];
			el.style.paddingRight = window.innerWidth - document.querySelector('.wrapper').offsetWidth + 'px';
		}
		body.style.paddingRight = window.innerWidth - document.querySelector('.wrapper').offsetWidth + 'px';
		document.documentElement.classList.add("lock");

		bodyLockStatus = false;
		setTimeout(function () {
			bodyLockStatus = true;
		}, delay);
	}
}