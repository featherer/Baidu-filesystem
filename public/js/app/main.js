'use strict'
require(['jquery', 'Filesystem'], function ($, Filesystem) {
	var inputPath = $('.input-path'),
		inputConfirm = $('.confirm-path'),
		filesystem;
	inputConfirm.on('click', function () {
		var inputValue = inputPath.val();
		if (inputValue[0] !== '/') {
			alert("error");
			return false;
		}
		if (inputValue.slice(-1) !== '/') {
			inputValue += '/';
		}
		filesystem = new Filesystem(inputValue);
		return false;
	})
	$('.content').on('click', 'a', function (e) {
		filesystem.changePath(e);
	})

	var uploadTrigger = $('#upload');
	var file = $('#file');
	uploadTrigger.on('click', function (e) {
		file.trigger('click');
	})
	file.on('change', function (e) {
		var form = new FormData();
		var files = file[0].files;
		if (files) {
			form.append('upload', files[0]);
			form.append('uploadPath', filesystem.path);
		}
		$.ajax({
			type: 'post',
			url: '/upload',
			data: form,
			processData: false,
			contentType: false
		}).done(function () {
			filesystem.getContent();
		})
	})
	$(document).on('click', '.rename, .delete, #create', function (e) {
		var target = $(e.target),
		isCreate = target.data('action') === 'create',
		isRename = target.data('action') === 'rename',
		confirmButton = $('#action-confirm'),
		action = target.data('action'),
		modal = $('#action-modal'),
		title = modal.find('#modal-title'),
		origname, titleText;
		titleText = action[0].toUpperCase() + action.slice(1);
		if (isCreate) {
			origname = $('#action-input').val();
			titleText = titleText + ' a new file';
			confirmButton.data('data', {action: 'create'})
		} else {
			origname = target.parents('[data-type]').eq(0).find('td').eq(0).text();
			titleText = titleText + ' ' + origname;
			if (!isRename) {
				modal.addClass('modal-delete');
				confirmButton.data('data', {
					origname: origname,
					action: action
				})
			} else {
				confirmButton.data('data', {
					origname: origname,
					filename: $('#action-input').val(),
					action: action
				})
			}
		}
		title.text(titleText);
	})
	$('#action-modal').on('hidden.bs.modal', function () {
		$(this).removeClass('modal-delete');
		$('#action-input').val('');
	})
	$(document).on('click', '#action-confirm', function () {
		var confirmButton = $(this),
			data = confirmButton.data('data');
		$('#action-modal').modal('hide');
		$.ajax({
			type: 'post',
			url: '/action',
			data: {
				path: filesystem.path,
				filename: (function () {
					if (data.action === 'rename') {
						return $('#action-input').val();
					}
				})(),
				origname: (function () {
					if (data.action !== 'create') {
						return data.origname;
					} else {
						return $('#action-input').val();
					}
				})(),
				action: (function () {
					if (data.action !== 'create') {
						return data.action;
					} else {
						return 'create';
					}
				})() 
			}
		}).done(function () {
			filesystem.getContent();
		})
	})
})