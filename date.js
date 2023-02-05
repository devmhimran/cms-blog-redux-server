const databaseTime = 1675306535653;

module.exports.timeCalc = (databaseTime) => {
    const date = new Date();
    const time = date.getTime()


    const timeDifference = time - databaseTime

    const minute = Math.round(timeDifference / (60 * 1000))
    const hour = Math.round(timeDifference / (60 * 60 * 1000))
    const day = Math.round(timeDifference / (60 * 60 * 24 * 1000))
    const week = Math.round(timeDifference / (60 * 60 * 24 * 7 * 1000))
    const month = Math.round(timeDifference / (60 * 60 * 24 * 30 * 1000))
    const year = Math.round(timeDifference / (60 * 60 * 24 * 365 * 1000))

    if (minute < 1) {
        return "Just Now"
    } else if (minute <= 60) {
        if (minute === 1) {
            return 'one minute ago'
        } else {
            return minute + ' ' + 'minute ago'
        }
    } else if (hour <= 24) {
        if (hour === 1) {
            return 'an hour ago'
        } else {
            return hour + ' ' + 'hour ago'
        }
    } else if (day <= 7) {
        if (day === 1) {
            return 'yesterday'
        } else {
            return day + ' ' + 'day ago'
        }
    } else if (week <= 4.3) {
        if (week === 1) {
            return 'a week ago'
        } else {
            return week + ' ' + 'week ago'
        }
    } else if (month <= 12) {
        if (month === 1) {
            return 'a month ago'
        } else {
            return month + ' ' + 'month ago'
        }
    } else {
        if (year === 1) {
            return 'one year ago'
        } else {
            return year + ' ' + 'year ago'
        }
    }
}


