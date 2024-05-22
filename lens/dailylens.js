class DailyLens {
    diary_folder = 'review/diary'

    // date operations
    days_later(date_str, days) {
        let date = new Date(date_str)
        date.setDate(date.getDate() + days)
        return date.toISOString().split('T')[0]
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
        return Array.from({ length: duration }, (_, i) => this.days_later(start, i))
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
    time_stats(dv, dates) {
        let date_time_dict = {}
        let entry_set = new Set()
        
        for (let date of dates) {
            date_time_dict[date] = {}
            try {
                for (let [key, value] of Object.entries(dv.page(`${this.diary_folder}/${date}.md`))) {
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