# Hivemind

**Hivemind** displays usage stats for the Berkeley EECS instructional computers.

## How does it work?

Every five minutes, `backend/census.py` is executed. It connects to each server listed in `backend/server.txt` via SSH and collects information. The results from all of the servers are combined into a single JSON file (`data/latest.json`), which is hosted on my VPS.

You can view the most recently generated JSON file here: [https://labs.aguo.us/hivemind/data/latest.json](https://labs.aguo.us/hivemind/data/latest.json).

### Overall load formula

The "overall load" heuristic is implemented in `toRating()` in [`main.js`](https://github.com/guoguo12/hivemind/blob/gh-pages/js/main.js).

## How to contribute

Want to host the website locally? Clone this repo, switch to the `gh-pages` branch, and start a web server in the project root directory.

The backend (i.e. the script that grabs data from the servers) is a little harder to set up:

0. Install [pysftp](https://pypi.python.org/pypi/pysftp).
1. Clone this repo, switch to the `gh-pages` branch, and navigate to `backend/`.
2. Make a directory called `private/`.
3. Create an RSA key pair (`id_rsa` and `id_rsa.pub`) inside `private/` with no passphrase.
4. Add the public key to your class account's `~/.ssh/authorized_keys` file.
5. Change the value of `LOGIN_USERNAME` in `census.py` to your login.

You should then be able to execute `census.py` to grab data from each server in `servers.txt`.
The results are printed to stdout.

## Credits

Hivemind was made using jQuery, Vue.js, Moment.js, Skeleton, clipboard.js, and Hint.css.
