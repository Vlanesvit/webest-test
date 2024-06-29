
function productCart() {
	const aboutBtn = document.querySelectorAll('.catalog .catalog__buttons .btn');
	const modal = document.querySelector('.popup');
	const itemCartBtn = modal.querySelector('.catalog__buttons .btn');
	const quantityValue = modal.querySelector('[data-quantity-value]')
	const cartCount = document.querySelector('.header__cart_counter');
	const cartItems = document.querySelector('.header__cart_items');
	const headCartBtn = document.querySelector('.header__cart_btn');
	const headCartModal = document.querySelector('.header__cart_modal');
	const totalPriceElement = document.querySelector('.header__cart_total_price');

	// Функция для сохранения данных корзины в localStorage
	function saveCart() {
		const cartItem = document.querySelectorAll('.header__cart_item');
		const items = [];
		cartItem.forEach(item => {
			items.push({
				img: item.querySelector('.header__cart_item-img img').src,
				title: item.querySelector('.header__cart_item-desc h4').textContent,
				quantity: item.querySelector('.header__cart_item-desc p').textContent.split(': ')[1],
				price: item.querySelector('.header__cart_item-price').textContent.split(': ')[1],
			});
		});
		localStorage.setItem('cartCount', cartCount.textContent);
		localStorage.setItem('cartItems', JSON.stringify(items));
	}

	// Функция для загрузки данных корзины из localStorage
	function loadCart() {
		const count = localStorage.getItem('cartCount');
		const items = JSON.parse(localStorage.getItem('cartItems'));

		if (count) {
			cartCount.textContent = count;
		}

		if (items) {
			items.forEach(item => {
				// Динамическое добавление товара в корзину
				const cartItem = createCartItem(item.img, item.title, item.quantity, item.price);
				cartItems.appendChild(cartItem);
			});
		}
	}

	// Загрузка данных корзины при загрузке страницы
	loadCart();

	// Функция для создания элемента товара в корзине
	function createCartItem(img, title, quantity, price) {
		const cartItem = document.createElement('div');
		cartItem.classList.add('header__cart_item');
		cartItem.innerHTML = `
			<div class="header__cart_item-img">
				<img src="${img}" alt="">
			</div>	
			<div class="header__cart_item-desc">
				<h4>${title}</h4>
				<p>Количество: ${quantity}</p>
				<div class="header__cart_item-price">Цена: ${price}</div>
			</div>
			<button type="button" class="remove-btn">&times;</button>
        `;
		cartItem.querySelector('.remove-btn').addEventListener('click', function () {
			removeCartItem(cartItem, quantity, price);
		});
		return cartItem;
	}

	// Функция для удаления товара из корзины
	function removeCartItem(cartItem, quantity, price) {
		cartItem.remove();
		const currentCount = parseInt(cartCount.textContent, 10);
		cartCount.textContent = currentCount - quantity;
		saveCart();
		updateTotalPrice();

		// Закрытие модального окна корзины если товаров нет
		const cartItems = document.querySelectorAll('.header__cart_item');
		if (cartItems.length === 0) {
			headCartModal.classList.remove('_show-cart');
		}
	}

	// Функция для обновления общей цены
	function updateTotalPrice() {
		const cartItem = document.querySelectorAll('.header__cart_item');
		let totalPrice = 0;
		cartItem.forEach(item => {
			const price = parseInt(item.querySelector('.header__cart_item-price').textContent.split(': ')[1].replace(' руб', ''), 10);
			const quantity = parseInt(item.querySelector('.header__cart_item-desc p').textContent.split(': ')[1], 10);
			totalPrice += price;
		});
		totalPriceElement.textContent = `Итоговая цена: ${totalPrice} руб`;
	}

	// Обработчик для кнопок "Подробнее"
	aboutBtn.forEach(button => {
		button.addEventListener('click', () => {
			const item = button.closest('.catalog__item');

			const itemImg = item.querySelector('.catalog__img img').src;
			const itemTitle = item.querySelector('.catalog__desc h4').textContent;
			const itemDescription = item.querySelector('.catalog__desc p').textContent;
			const itemPrice = item.querySelector('.catalog__price').textContent.split(': ')[1].replace(' руб', '');;

			const modalImg = modal.querySelector('.catalog__img img');
			const modalTitle = modal.querySelector('.catalog__desc h4');
			const modalDescription = modal.querySelector('.catalog__desc p');
			const modalPrice = modal.querySelector('.catalog__price');
			const modalQuantityInput = modal.querySelector('[data-quantity-value]');

			modalImg.src = `${itemImg}`;
			modalTitle.textContent = `${itemTitle}`;
			modalDescription.textContent = `${itemDescription}`;
			modalPrice.textContent = `Цена: ${itemPrice} руб`;
			modalQuantityInput.value = 1;
			modalQuantityInput.dataset.price = itemPrice; // Сохранение начальной цены для пересчета
		});
	});

	// Обработчик для изменения количества товаров в модальном окне
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
				value--;
				if (+valueElement.dataset.quantityMin) {
					if (+valueElement.dataset.quantityMin > value) {
						value = valueElement.dataset.quantityMin;
					}
				} else if (value < 1) {
					value = 1;
				}
			}
			valueElement.value = value;

			// Обновление цены в модальном окне при изменении количества
			const modal = targetElement.closest('.popup');
			const modalPrice = modal.querySelector('.catalog__price');
			const itemPrice = parseInt(valueElement.dataset.price, 10);
			const totalPrice = itemPrice * value;
			modalPrice.textContent = `Цена: ${totalPrice} руб`;
		}
	});

	// Обработчик для кнопки "Добавить в корзину" в модальном окне
	itemCartBtn.addEventListener('click', function () {
		const itemImg = modal.querySelector('.catalog__img img').src;
		const itemTitle = modal.querySelector('.catalog__desc h4').textContent;
		const itemPrice = modal.querySelector('.catalog__price').textContent.split(': ')[1].replace(' руб', '');
		const quantity = parseInt(quantityValue.value, 10);
		const currentCount = parseInt(cartCount.textContent, 10);
		quantityValue.value = 1;
		cartCount.textContent = currentCount + quantity;


		// Динамическое добавление товара в корзину
		const cartItem = createCartItem(itemImg, itemTitle, quantity, itemPrice);
		cartItems.appendChild(cartItem);

		// Сохранение данных корзины
		saveCart();

		// Обновление общей цены
		updateTotalPrice();
	});

	// Обработчик для открытия модального окна корзины
	headCartBtn.addEventListener('click', function () {
		if (parseInt(cartCount.textContent, 10) != 0) {
			headCartModal.classList.toggle('_show-cart');
		}
	});

	// Закрытие модального окна при клике вне его области
	document.addEventListener('click', function (event) {
		if (!headCartModal.contains(event.target) && !event.target.closest('.header__cart_btn') && !event.target.closest('.remove-btn')) {
			headCartModal.classList.remove('_show-cart');
		}
	});
}
productCart()

// Класс модального окна
class Popup {
	constructor(options = {}) {
		// Установить конфигурацию по умолчанию
		const config = {
			logging: true,  // Логирование
			init: true,  // Инициализация при создании экземпляра
			attributeOpenButton: 'data-popup',  // Атрибут для кнопки открытия
			attributeCloseButton: 'data-close',  // Атрибут для кнопки закрытия
			fixElementSelector: '[data-lp]',  // Селектор фиксирующего элемента
			youtubeAttribute: 'data-popup-youtube',  // Атрибут для YouTube видео
			youtubePlaceAttribute: 'data-popup-youtube-place',  // Место для вставки YouTube видео
			setAutoplayYoutube: true,  // Автовоспроизведение YouTube видео
			classes: {
				popup: 'popup',  // Класс попапа
				popupContent: 'popup__content',  // Класс содержимого попапа
				popupActive: 'popup_show',  // Класс активного попапа
				bodyActive: 'popup-show'  // Класс активного состояния тела
			},
			focusCatch: false,  // Перехват фокуса
			closeEsc: true,  // Закрытие по Esc
			bodyLock: true,  // Блокировка прокрутки тела
			hashSettings: {
				location: true,  // Использование хэша в URL
				goHash: true  // Переход по хэшу
			},
			on: {
				beforeOpen: () => { },  // Функция перед открытием
				afterOpen: () => { },  // Функция после открытия
				beforeClose: () => { },  // Функция перед закрытием
				afterClose: () => { }  // Функция после закрытия
			}
		};

		// Объединить параметры пользователя с конфигурацией по умолчанию
		this.options = { ...config, ...options };
		this.options.classes = { ...config.classes, ...options.classes };
		this.options.hashSettings = { ...config.hashSettings, ...options.hashSettings };
		this.options.on = { ...config.on, ...options.on };

		this.youTubeCode = null;  // Код YouTube видео
		this.isOpen = false;  // Статус открытия попапа
		this.targetOpen = { selector: null, element: null };  // Целевой попап
		this.previousOpen = { selector: null, element: null };  // Предыдущий попап
		this.lastClosed = { selector: null, element: null };  // Последний закрытый попап
		this.lastFocusEl = null;  // Последний элемент фокуса
		this._focusEl = [  // Элементы, которые могут получить фокус
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

		// Инициализировать попапы, если опция init = true
		this.options.init && this.initPopups();
	}

	initPopups() {
		// Добавить обработчики событий для кликов и нажатий клавиш
		document.addEventListener("click", this.handleDocumentClick.bind(this));
		document.addEventListener("keydown", this.handleDocumentKeydown.bind(this));

		// Добавить обработчики для изменения и загрузки хэша, если это включено
		if (this.options.hashSettings.goHash) {
			window.addEventListener('hashchange', this.handleHashChange.bind(this));
			window.addEventListener('load', this.handleHashChange.bind(this));
		}
	}

	handleDocumentClick(e) {
		const buttonOpen = e.target.closest(`[${this.options.attributeOpenButton}]`);
		if (buttonOpen) {
			// Открыть попап при клике на кнопку открытия
			e.preventDefault();
			this.openPopup(buttonOpen);
		} else {
			const buttonClose = e.target.closest(`[${this.options.attributeCloseButton}]`);
			// Закрыть попап при клике на кнопку закрытия или вне попапа
			if (buttonClose || (!e.target.closest(`.${this.options.classes.popupContent}`) && this.isOpen)) {
				e.preventDefault();
				this.close();
			}
		}
	}

	handleDocumentKeydown(e) {
		// Закрыть попап по нажатию клавиши Escape
		if (this.options.closeEsc && e.key === 'Escape' && this.isOpen) {
			e.preventDefault();
			this.close();
		}
		// Перехватить фокус по нажатию Tab
		if (this.options.focusCatch && e.key === 'Tab' && this.isOpen) {
			this._focusCatch(e);
		}
	}

	handleHashChange() {
		// Открыть попап при изменении хэша
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