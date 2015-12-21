#!/usr/bin/env python

"""census.py - SSH into servers, grab vital stats, then print to stdout."""

import json
import logging
import time

import pysftp

SERVER_LIST = 'servers.txt'
HOST_SUFFIX = '.cs.berkeley.edu'
LOGIN_USERNAME = 'cs199-auk'
LOGIN_KEY_PATH = 'private/id_rsa'

LOG_PATH = 'output.log'
LOG_LEVEL = logging.INFO

EXEC_CMD = 'cat /proc/{uptime,loadavg} && who -q'
EXPECTED_OUTPUT_LINES = 4


def read_servers(list_path=SERVER_LIST):
    """Returns list of servers to look at.
    Reads SERVER_LIST by default.
    """
    with open(list_path, 'r') as list:
        return map(lambda s: s.strip(), list.readlines())


def poll(host):
    """Collects data from the given server by SSH-ing in (using pysftp) and
    running the EXEC_CMD. Returns a tuple: the first member is the output as
    a list of strings; the second is the elapsed time in seconds.
    """
    t_start = time.time()
    logging.info('Starting poll of %s' % host)

    with pysftp.Connection(host + HOST_SUFFIX, username=LOGIN_USERNAME,
                           private_key=LOGIN_KEY_PATH) as sftp:
        result = sftp.execute(EXEC_CMD)
        if len(result) != EXPECTED_OUTPUT_LINES:
            raise ValueError('Server output has wrong number of lines: %r'
                             % result)
        result = map(lambda s: s.rstrip('\n'), result)
        uptime = float(result[0].split(' ')[0])  # in seconds
        loadavgs = map(float, result[1].split(' ')[:3])  # over last 15 minutes
        users = [] if not result[2] else list(set(result[2].split(' ')))
        data = {'uptime': uptime,
                'load_avgs': loadavgs,
                'users': users}

    t_elapsed = time.time() - t_start
    logging.info('Finished poll of %s successfully in %fs' % (host, t_elapsed))
    return data, t_elapsed

if __name__ == '__main__':
    """Reads list of servers, then grabs data from each one. Prints the combined
    data in JSON format to stdout and writes a log to LOG_PATH."""
    logging.basicConfig(filename=LOG_PATH, level=LOG_LEVEL)
    results = {'time_begin': time.time(), 'elapsed': {}, 'data': {}}

    for server in read_servers():
        try:
            server_data, server_elapsed = poll(server)
            results['data'][server] = server_data
            results['elapsed'][server] = server_elapsed
        except:
            results['data'][server] = {}

    results['time_elapsed'] = time.time() - results['time_begin']
    print json.dumps(results, sort_keys=True, indent=4, separators=(',', ': '))
