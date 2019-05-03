/**
* publish.image_upload
* @author Deux Huit Huit
* @license MIT
*/
(function ($, S) {

	'use strict';

	var sels = {
		field: '.field-image_upload',
		editor: '.image-upload-editor',
		input: '.image-upload-input',
		meta: '.image-upload-meta',
		remove: '.image-upload-remove',
		imageCtn: '.image-ctn',
		label: '.image-upload-label'
	};

	var initEditor = function (field) {
		var meta = field.find(sels.meta);
		var editor = field.find(sels.editor);

		if (!editor.length) {
			return;
		}

		var savedMeta = JSON.parse(meta.attr('value') || '{}');

		var config = {
			onCropEnd: function (value) {
				savedMeta = JSON.parse(meta.attr('value') || '{}');
				meta.val(JSON.stringify(Object.assign({}, savedMeta, {crop: value})));
			},
			onInitialize: function (instance) {
				if (!!savedMeta.crop) {
					instance.moveTo(~~(editor.outerWidth() * savedMeta.crop.x), ~~(editor.outerHeight() * savedMeta.crop.y));
					instance.resizeTo(~~(editor.outerWidth() * savedMeta.crop.width), ~~(editor.outerHeight() * savedMeta.crop.height), [0,0]);
				}
			},
			returnMode: 'ratio'
		};

		if (!!field.attr('data-viewport-width') && !!field.attr('data-viewport-height')) {
			config['aspectRatio'] = parseInt(field.attr('data-viewport-height'), 10) / parseInt(field.attr('data-viewport-width'), 10);
			field.addClass('is-forced-ratio');
		}

		var croppr = new window.Croppr('#' + field.attr('id') + ' ' + sels.editor + ' img', config);
	};

	var addEditorDom = function (field, src) {
		var label = field.find(sels.label);
		var editor = $('<div />').attr({
			class: sels.editor.replace('.', '') + sels.imageCtn.replace('.', ' ')
		});

		editor.append($('<img />').attr({
			src: src
		}));

		label.append(editor);
		editor.outerWidth();
	};

	var onRemoveClick = function (event) {
		var t = $(this);
		var field = t.closest(sels.field);
		var hiddenInput = field.find(sels.input);
		var ctn = field.find(sels.imageCtn).parent();
		var meta = field.find(sels.meta);

		// Remove the editor or the image
		field.find(sels.imageCtn).remove();

		// Add a fresh input
		ctn.append($('<input />').attr({
			type: 'file',
			name: hiddenInput.attr('name'),
			class: sels.input.replace('.', '')
		}));

		// Remove the hidden image input
		hiddenInput.remove();
		
		// Flush the metas
		meta.attr('value', '');

		// Hide the remove btn
		t.hide();

		event.preventDefault();
		return event.stopPropagation();
	};

	var onInputChange = function (e) {
		var t = $(this);
		var field = t.closest(sels.field);
		var hasEditor = field.attr('data-editor') === 'yes';
		var file = !!e && !!e.target.files && e.target.files[0];
			file = file || (t[0].files && t[0].files[0]);

		if (!file) {
			return;
		}

		// hide the input
		t.hide();
		
		if (file.type.indexOf('image') >= 0) {
			var reader = new window.FileReader();

			reader.onload = function readerLoaded (event) {
				var r = event.target.result;
				if (!!r) {
					addEditorDom(field, r);
					if (!!hasEditor && file.type.indexOf('svg') === -1) {
						initEditor(field);
					}
				}
			};

			reader.readAsDataURL(file);
		}

		// show the remove btn
		field.find(sels.remove).show();
	};

	var initOne = function () {
		var field = $(this);
		var input = field.find(sels.input);
		var remove = field.find(sels.remove);
		var hasEditor = field.attr('data-editor') === 'yes';

		remove[!!input.attr('value') ? 'show' : 'hide']();

		if (!input.attr('value')) {
			return;
		}

		addEditorDom(field, input.attr('value'));
		
		if (!!hasEditor) {
			initEditor(field);
		}
	};

	var init = function () {
		S.Elements.contents.find(sels.field).each(initOne);
		S.Elements.contents.find(sels.remove).on('click', onRemoveClick);
		S.Elements.contents.find(sels.field).on('change', sels.input, onInputChange);
		S.Elements.contents.find(sels.label).on('click', function (event) {
			if (!$(event.target).is('input')) {
				event.preventDefault();
				event.stopPropagation();
				return false;
			}
		});
	};

	$(init);
	
})(jQuery, window.Symphony);
