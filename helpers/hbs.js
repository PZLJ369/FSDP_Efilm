const moment = require('moment');

module.exports = {
    formatDate: function (date, targetFormat) {
        return moment(date).format(targetFormat);
    },
    radioCheck: function (value, radioValue) {
        // Write your codes here
        if (value === radioValue) {
            return 'checked';
        } else {
            return '';
        }
    },
    replaceCommas: function(str){
		if (str != null && str.length < 0){
			if (str.trim().length !== 0) {
				// uses pattern-matching string /,/g for ','
				return str.replace(/,/g, ' | ');
			}
		}
		return 'None';
	},
};
