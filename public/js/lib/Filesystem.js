'user strict'
define(['jquery'], function ($) {
	var Filesystem = function (path) {
		this.origPath = path;
		this.path = path;
		this.init();
		this.template = '<tr data-type="{{ type }}"><td>{{ name }}</td><td>' +
		'{{ type }}</td><td>{{ size }}</td><td>{{ date }}</td><td><div>' +
		'<button class="btn btn-warning rename" type="button" data-action="rename"' +
		'data-target="#action-modal" data-toggle="modal">Rename</button> ' +
		'<button class="btn btn-danger delete" type="submit" data-action="delete"' +
		'data-target="#action-modal" data-toggle="modal">Delete</button></div>' +
		'</td></tr></table>';
	};
	Filesystem.prototype = {
		constructor: Filesystem,
		init: function () {
			this.readPath();
		},
		changePath: function (e) {
			var target = $(e.target),
				isHeading = target.parents('.currentPath').length > 0,
				isDirectory = target.parents('[data-type=directory]').length > 0;
			if (isHeading) {
				this.path = this.origPath + target.prevAll().addBack().text().slice(1);
			} else if (isDirectory) {
				this.path = this.path + target.text() + '/';
			}
			this.readPath();
		},
		readPath: function () {
			var that = this;
			$.post('/', {path: that.path}, function (data) {
				if (data.error) {
					that.displayError(data.error);
					return;
				} else {
					that.json = data;
					that.enter();
				}
			});
		},
		enter: function () {
			this.displayHeading();
			this.displayContent();
		},
		displayHeading: function () {
			var that = this,
				heading = $('.currentPath'),
				headingList = this.path === this.origPath ? [] : 
					this.path.slice(that.origPath.length, -1).split('/'),
				str = '<a>/</a>'; 
			for(var i = 0; i < headingList.length; i++) {
				str = str + '<a>' + headingList[i] + '/</a>';
			}	
			heading.empty().append(str);
		},
		displayContent: function () {
			var that = this,
				docfrag = document.createDocumentFragment(),
				regex = /\{\{\s+(\w+)\s+\}\}/g;
			$('.table > tbody').find('[data-type]').remove();
			$.each(that.json.data, function (i, v) {
				var s = that.template;
				if (v.type === 'directory') {
					s = s.replace('{{ name }}', '<a>{{ name }}</a>');
				}
				$.each(v, function (key, value) {
					s = s.replace(regex, function (_, word) {
						return v[word] || '/';
					});
				})
				$(s.replace(regex, '')).appendTo(docfrag);
				$(docfrag).find('[data-type=directory]').addClass('active');
			})
			$('.table > tbody').append(docfrag);
		},
		displayError: function (error) {
			alert(error);
		},
	}
	return Filesystem; 
})