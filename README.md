# Hivemind

**Hivemind** provides up-to-date stats on the Berkeley EECS instructional computers.

Send feedback and feature requests to guoguo12@gmail.com.

## How Does It Work?
*Note: All files are on the `gh-pages` branch.*

Every 10 minutes, `backend/census.py` is executed. It connects to each server in `server.txt` via SSH and collects information by running three commands (`cat /proc/{uptime,loadavg} && who -q`). The results are combined into one big JSON file (`data/latest.json`), which is then uploaded using Git.

## How to Contribute

To run the website on your computer, clone this repo and switch to the `gh-pages` branch. You should then be able to run a webserver in the `hivemind/` directory. For example, try running the following from your terminal:

```bash
python -m SimpleHTTPServer 8080  # Replace SimpleHTTPServer with http.server if using Python 3
```

You should then see the website at [http://localhost:8080](http://localhost:8080).

The backend (i.e. the script that grabs data from the servers) is a little more complciated to set up:
* Navigate to `backend/`.
* Make a directory called `private/`.
* Create an RSA key pair (`id_rsa` and `id_rsa.pub`) inside `private/` with no passphrase.
* Add the public key to your class account's `~/.ssh/authorized_keys` file.
* Change the value of `LOGIN_USERNAME` in `census.py` to your login.

You should then be able to run `python census.py` to grab data from each server in `servers.txt`.
The results are printed to stdout. Running `census.py` will create a log file called `output.log`;
I recommend watching this file as `census.py` is running, since `census.py` doesn't give any indication of progress.

## Credits

Hivemind was made using jQuery (with the Tablesorter plugin), Moment.js, Skeleton, and Hint.css.
