# Clork

A minimal CLI for tracking work hours. Clock in, clock out, see your time.

## Install

```bash
npm install -g clork
```

Or clone and link locally:

```bash
git clone https://github.com/YOUR_USERNAME/clork.git
cd clork
npm link
```

## Usage

```bash
clork in       # Start tracking
clork out      # Stop tracking
clork status   # Are you clocked in?
clork today    # Total time worked today
clork log      # Recent entries
```

## Example

```
$ clork in
Clocked in at 09:00:00

$ clork status
Currently clocked in since 09:00:00
Current session: 2h 30m 15s

$ clork out
Clocked out at 11:30:15
Session duration: 2h 30m 15s

$ clork today
Today's total: 2h 30m 15s
Sessions: 1
```

## Data Storage

Everything goes into `~/.clork/timesheet.csv`:

```csv
date,time,action
2026-03-02,09:00:00,in
2026-03-02,11:30:15,out
```

Plain CSV, easy to edit or export.

## Contributing

1. Fork it
2. Create your branch (`git checkout -b feature/thing`)
3. Commit your changes (`git commit -m 'Add thing'`)
4. Push (`git push origin feature/thing`)
5. Open a PR

### Ideas for contributions

- Weekly/monthly summaries
- Custom CSV export path
- Break tracking
- Config file support
- Better time formatting options
