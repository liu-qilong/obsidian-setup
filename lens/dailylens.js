class DailyLens {
    color_palette = '#fbcd9ba0, #bbbbbba0, #e18683a0, #037d7ea0, #ffffffa0'

    tag_dict = {
        'Type/Paper': {
            'show_name': 'Papers 📃',
            'match_vars': ['date', 'update'],
            'show_vars': ['bib_title', 'bib_cites', 'bib_badge'],
        },
        'Type/Note': {
            'show_name': 'Notes ✍️',
            'match_vars': ['date', 'update'],
            'show_vars': ['date', 'update'],
        },
    }

    set_up(dv) {
        this.dv = dv
    }

    // formatting
    date2str(date) {
        return String(date).split('T')[0]
    }

    date_str2year_month_day(date) {
        let [year, month, day] = date.split('-')
        return {
            'year': year,
            'month': month,
            'day': day,
        }
    }

    // date parsing
    get_week(date) {
        let today = new Date(date)
        let onejan = new Date(today.getFullYear(), 0, 1)
        let dayOfYear = ((today - onejan + 86400000)/86400000)
        return Math.ceil(dayOfYear/7)
    }

    get_year(date){
        return new Date(date).getFullYear()
    }

    // dates
    days_later(date_str, days) {
        let date = new Date(date_str)
        date.setDate(date.getDate() + days)
        return date.toISOString().split('T')[0]
    }

    days_before(date_str, days) {
        let date = new Date(date_str)
        date.setDate(date.getDate() - days)
        return date.toISOString().split('T')[0]
    }

    dates_till_date(date, duration = 7) {
        return Array.from({ length: duration }, (_, i) => this.days_before(date, duration - i - 1))
    }

    day_dates(date) {
        return [String(date).split('T')[0]]
    }

    week_dates(year, week) {
        let date = new Date(`${year}-01-01`)
        let day_of_week = date.getDay()
        let first_mon = new Date(date.setDate(1 + (1 + 7 - day_of_week) % 7))
        let week_start = new Date(first_mon.setDate(first_mon.getDate() + (week - 1) * 7))
        
        return Array.from({ length: 7 }, (_, i) => this.days_later(week_start, i))
    }
    
    quarter_dates(year, quarter) {
        let month = (quarter - 1) * 3
        let start = new Date(year, month, 1)
        let end = new Date(year, month + 3, 0)
        let duration = (end - start) / (1000 * 60 * 60 * 24) + 1
        return Array.from({ length: duration }, (_, i) => this.days_later(start, i + 1))
    }

    timestr2hour(time_str) {
        try {
            const [hours, minutes] = time_str.split(':')
            return parseInt(hours) + parseInt(minutes) / 60
        } catch {
            return 0
        }
    }

    // time stats
    time_stats(dates) {
        /* return {type: time_array} */
        let date_time_dict = {}
        let entry_set = new Set()
        
        for (let date of dates) {
            date_time_dict[date] = {}
            try {
                for (let [key, value] of Object.entries(this.dv.page(date))) {
                    if (key.includes('time_')) {
                        entry_set.add(key.replace('time_', ''))
                        date_time_dict[date][key.replace('time_', '')] = this.timestr2hour(value)
                    }
                }
            } catch {
            continue
            }
        }
        
        let time_dict = {}
        
        for (let entry of entry_set) {
            time_dict[entry] = []
            for (let date of dates) {
                time_dict[entry].push(date_time_dict[date][entry] || 0)
            }
        }

        return time_dict
    }
}