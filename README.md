# Hivemind

**Hivemind** provides up-to-date stats on the Berkeley EECS instructional computers.

## How Does It Work?

Every 10 minutes, `backend/census.py` is executed. It connects to each server in `server.txt` via SSH and collects information. The results from all of the servers are combined into a single JSON file (`data/latest.json`), which is then uploaded to [Firebase Hosting](https://www.firebase.com/hosting.html).

You can view the most recently generated JSON file here: [https://hivemind-data.firebaseapp.com/latest.json](https://hivemind-data.firebaseapp.com/latest.json).

## How to Contribute

Want to host the website locally? Clone this repo, switch to the `gh-pages` branch, and start a web server in the project root directory.

The backend (i.e. the script that grabs data from the servers) is a little harder to set up:

1. Navigate to `backend/`.
2. Make a directory called `private/`.
3. Create an RSA key pair (`id_rsa` and `id_rsa.pub`) inside `private/` with no passphrase.
4. Add the public key to your class account's `~/.ssh/authorized_keys` file.
5. Change the value of `LOGIN_USERNAME` in `census.py` to your login.

You should then be able to execute `census.py` to grab data from each server in `servers.txt`.
The results are printed to stdout.

## Credits

Hivemind was made using jQuery (with the Tablesorter plugin), Moment.js, Skeleton, and Hint.css.
