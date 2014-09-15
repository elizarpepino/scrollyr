/**
 *		The MIT License (MIT)
 *
 *		Copyright (c) 2014 Elizar Pepino <hello@elizarpepino.com>
 *
 *		Permission is hereby granted, free of charge, to any person obtaining a copy
 *		of this software and associated documentation files (the "Software"), to deal
 *		in the Software without restriction, including without limitation the rights
 *		to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *		copies of the Software, and to permit persons to whom the Software is
 *		furnished to do so, subject to the following conditions:
 *
 *		The above copyright notice and this permission notice shall be included in
 *		all copies or substantial portions of the Software.
 *
 *		THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *		IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *		FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *		AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *		LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *		OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *		THE SOFTWARE.
 *
 *		@author Elizar Pepino http://elizarpepino.com
 *		@version 0.0.1
 */
(function (w) {
		'use strict';

		w.Scrollyr = w.Scrollyr || Scrollyr;

		var utils = {
				browserIs: function (browserName) {
						var agent = window.navigator.userAgent;
						var regex = new RegExp(browserName, 'i');

						return regex.test(agent);
				},

				platformIs: function (platformName) {
						return this.browserIs(platformName);
				}
		};

		function Emeter() {}
		Emeter.prototype = {
				constructor: Emeter,

				on: function (event, callback) {
						if (typeof callback !== 'function') {
								throw new Error('callback should be of type `function`');
						}

						this.events = this.events || {};

						if (!this.events[event]) {
								this.events[event] = [];
						}

						this.events[event].push(callback);
				},

				off: function (event, callback) {
						if (typeof callback !== 'function') throw new Error('callback should be of type `function`');

						if (!this.events[event]) {
								return;
						}

						var _event = this.events[event];
						var _index = _event.indexOf(callback);

						if (_index !== -1) _event.splice(_index, 1);

				},

				emit: function (event, data) {
						var evt = this.events[event];
						var len = evt.length;

						if (!len) return;

						while (len--) {
								evt[len].call(null, data);
						}
				}
		};

		function Scrollyr(target, options) {
				options = options || {};

				var _target = target || document.body;

				var self = Object.create(Emeter.prototype);
				self.constructor = Scrollyr;

				if (typeof _target === 'string') self.el = document.querySelector(_target);
				else self.el = _target;

				if (!target || target === 'body') self.el.style.height = w.innerHeight + 'px';

				self.el.innerHTML = '<div class="sc-container">' + self.el.innerHTML;
				self.el.innerHTML += '</div>';

				var container = self.el.querySelector('.sc-container');

				self.el.style.overflow = 'hidden';

				var scroll = 0;
				var height = self.el.offsetHeight;
				var scrollableHeight = container.offsetHeight - height;

				if (scrollableHeight > 0) setupBindings();

				function setupBindings() {
						var binder = document.attachEvent ? 'attachEvent' : 'addEventListener';
						var evt = utils.browserIs('firefox') ? 'DOMMouseScroll' : 'mousewheel';

						if (binder === 'attachEvent') evt = 'on' + evt;

						scrollableHeight *= -1;

						self.scrollbar = new Scrollbar({
								container: self.el,
								scrollBarHeight: height,
								contentHeight: container.offsetHeight
						});
						self.on('scrolling', self.scrollbar.updateScroll);

						self.el[binder](evt, handleScrollWheel);
						self.on('scrolling', updateContainer);
				}

				function handleScrollWheel(e) {
						e.stopPropagation();

						var deltaY = e.wheelDelta || -e.detail; // give this negative value for firefox
						scroll += deltaY;

						if (scroll > 0) {
								scroll = 0;
						} else if (scroll < scrollableHeight) {
								scroll = scrollableHeight;
						}

						var amountScrolled = Math.max(scrollableHeight, Math.min(0, scroll));

						self.emit('scrolling', {
								progress: amountScrolled / scrollableHeight * 100
						});
				}

				function updateContainer(e) {
						container.style.marginTop = e.progress / 100 * scrollableHeight + 'px';
				}

				return self;
		}

		function Scrollbar(options) {
				options = options || {};

				var scrollbar, scrobber, scrobberHeight;

				var _width = '3px';
				var _height = '200px';
				var _rightMargin = '0';
				var _bgColor = 'rgba(0, 0, 0, 0.3)';
				var _color = 'rgba(0, 0, 0, 1)';
				var _scrollbarCN = 'sc-scrollbar';
				var _scrobberCN = 'sc-scrobber';

				var _scrollableHeight = options.contentHeight - options.scrollBarHeight;

				var self = Object.create(Emeter.prototype);

				scrollbar = document.createElement('div');
				scrobber = document.createElement('div');
				scrollbar.appendChild(scrobber);

				scrollbar.className = _scrollbarCN;
				scrollbar.style.padding = '0';
				scrollbar.style.margin = '0';
				scrollbar.style.height = options.scrollBarHeight ? options.scrollBarHeight + 'px' : _height;
				scrollbar.style.width = options.scrollBarWidth ? options.scrollBarWidth + 'px' : _width;
				scrollbar.style.backgroundColor = options.scrollBarBackGroundColor || _bgColor;
				scrollbar.style.position = 'absolute';
				scrollbar.style.top = '0';
				scrollbar.style.right = options.rightMargin ? options.rightMargin + 'px' : _rightMargin;

				scrobber.className = _scrobberCN;
				scrobber.style.backgroundColor = options.scrollbarColor || _color;

				scrobberHeight = options.scrollBarHeight - (Math.abs(_scrollableHeight) / options.contentHeight) * options.scrollBarHeight;
				scrobber.style.height = scrobberHeight + 'px';


				self.attach = function (element) {
						var _el;
						if (typeof element === 'string')
							_el = document.queryString(element);
						else
							_el = element;

						_el.appendChild(scrollbar);
				};

				self.updateScroll = function (e) {
						var top = e.progress / 100 * (scrollbar.offsetHeight - scrobber.clientHeight);

						scrobber.style.marginTop = Math.max(0, top) + 'px';
				};

				if (options.container) self.attach(options.container);

				return self;
		}
})(window);