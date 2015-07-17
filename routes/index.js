var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var fse = require('fs-extra');
var multer = require('multer');

router.get('/', function (req, res, next) {
	res.render('index');
})

router.post('/', function (req, res, next) {
	var path;
	function getCurrentList(path, fileList) {
		fs.readdir(path, function (err, files) {
			var promises = Array.prototype.map.call(files, function (item) {
				return new Promise(function (resolve, reject) {
					fs.stat(path + '/' + item, function (error, stats) {
						if (stats.isDirectory()) {
							fileList.directory[item] = stats;
						} else {
							fileList.file[item] = stats;
						}
						resolve();
					})
				})
			})
			Promise.all(promises).then(function (data) {
				res.send(extractInfo(fileList));
			})
		});
	}
	function extractInfo(fileList) {
		var tmp = ['file', 'directory'],
			fileInfo = {data: []},
			list, item;
		for (var i = 0; i < 2; i++) {
			list = fileList[tmp[i]];
			for (var j in list) {
				if (list.hasOwnProperty(j)) {
					item = list[j];
					fileInfo.data.push({
						name: j, 
						type: tmp[i],
						size: (function (size) {
							if (i === 0) { return size; }
							else { return '#'; }
						})(item.size),
						date: item.mtime
					})
				}
			}
		}
		return fileInfo;
	}
	if (req.body.path) {
		path = req.body.path;
		if (!fs.existsSync(path)) {
			res.send({error: 'Path not exists'});
		} else {
			var fileList = getCurrentList(path, {file: {}, directory: {}});
		}
	}
})

router.post('/upload', function (req, res, next) {
	var uploadPath = req.body.uploadPath,
		name = req.files.upload.name,
		origPath = path.join(__dirname, '..', ('' + req.files.upload.path));
	fse.move(origPath, uploadPath + name, function (err) {
		console.log(err);
	});
})

router.post('/action', function (req, res, next) {
	var filepath = req.body.path,
		action = req.body.action,
		origname = req.body.origname,
		filename = req.body.filename;
	if (action === 'create') {
		fs.openSync(path.join(filepath, origname), 'w');
	} else if (action === 'delete') {
		fse.removeSync(path.join(filepath, origname))
	} else {
		fs.renameSync(
			path.join(filepath, origname),
			path.join(filepath, filename)
		)
	}
	res.send(true);
})

module.exports = router;
