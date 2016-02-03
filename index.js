fs          = require('fs');
csv         = require('csv');
async       = require('async');
natural     = require('natural');
_           = require('lodash');

module.exports = {
	opt : {},
	combine : function(csvo, csvc, opt) {
		var raw, processed;
		
		opt = this.opt;
		parent = this;
		
		raw = parent.extract(csvo, csvc, function(err, data) {
			processed = parent.process(data);
			
			if(typeof processed == 'object' && processed.length) {
				parent.build(processed);
			};
		});
	},
	extract : function(csvo, csvc, cb) {
		parent = this;
			
		async.map([csvo, csvc], parent.data, function(err, result) {
			if (err) return cb(err);
			
			return cb(null,result);
		});
	},
	data : function(filepath, cb) {
		csv.parse(fs.readFileSync(filepath, 'utf8'), {}, function(err, output) {
			if (err) return cb(err);
			
			return cb(null,output);
		});
	},
	clean : function(raw) {
		var parent, str, arr;
		
		parent = this;
		str = '';
		arr = [];
		raw.splice(0,1);
		
		_.forEach(raw, function(val, i) {
			var str, row, front;
			
			str = '';
			row = [];
			
			str = val.join(' ').toLowerCase();
			row = str.split(/[\s,\=\-\>\<\:\{\}\/]+/);
			row = _.compact(row);
			if (parent.opt.removeWords) {
				row = _.pullAll(row, parent.opt.removeWords);
			}
			str = row.join(' ');
			arr.push(str);
		});
		return arr;
	},
	process : function(raw) {
		var main, comparison, mArr, cArr, row, combined, parent;
		
		parent = this;
		main = raw[0];
		comparison = raw[1];
		combined = [];
		
		//set up comparison strings for main and comparison rows
		mArr = parent.clean(main);
		cArr = parent.clean(comparison);
		
		//compare and find matches for each main row, and tack on the mysql row underneath
		_.forEach(mArr, function(mRow, mIdx) {
			var bestLd,bestDc,bestJw,bestLdIdx,bestDcIdx,bestJwIdx, matchedIdx;
			
			matchedIdx = [];
			
			_.forEach(cArr, function(cRow, cIdx) {
				var ld, dc, jw;
				
				ld = natural.LevenshteinDistance(mRow, cRow);
				// dc = natural.DiceCoefficient(mRow, cRow);
				// jw = natural.JaroWinklerDistance(mRow, cRow);
				
				//initialize the uinintialized
				if (!bestLd) {
					bestLd = ld;
					bestLdIdx = cIdx;
				}
				// if (!bestDc) {
				// 	bestDc = dc;
				// 	bestDcIdx = cIdx;
				// }
				// if (!bestJw) {
				// 	bestJw = jw;
				// 	bestJwIdx = cIdx;
				// }
				
				//set best scores
				if (ld < bestLd) {
					bestLd = ld;
					bestLdIdx = cIdx;
				}
				// if (dc > bestDc) {
				// 	bestDc = dc;
				// 	bestDcIdx = cIdx;
				// }
				// if (jw > bestJw) {
				// 	bestJw = jw;
				// 	bestJwIdx = cIdx;
				// }
			});
			combined.push(main[mIdx]);
			
			matchedIdx.push(bestLdIdx);
			// matchedIdx.push(bestDcIdx);
			// matchedIdx.push(bestJwIdx);
			//
			matchedIdx = _.uniq(matchedIdx);
			_.forEach(matchedIdx, function(idx, k) {
				combined.push(comparison[idx]);
			});
		});
		
		return combined;
	},
	build : function(combined) {
		csv.stringify(combined, function(err, output){
			if (err) return console.log(err);
			
			fs.writeFile("./output.csv", output, function(err) {
				if(err) return console.log(err);
				
				console.log("The file was saved!");
			});
		});
	}
};