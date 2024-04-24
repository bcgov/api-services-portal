import os
from datetime import datetime
import json
from pathlib import Path
import requests
from requests.auth import HTTPBasicAuth
import sys

ASTRA_SCAN_RESULTS = os.environ.get('ASTRA_SCAN_RESULTS')

JIRA_EMAIL = os.environ.get('JIRA_EMAIL')
JIRA_API_KEY = os.environ.get('JIRA_API_KEY')
JIRA_API_URL = "https://dpdd.atlassian.net/rest/api/2"
JIRA_AUTH = HTTPBasicAuth(JIRA_EMAIL, JIRA_API_KEY)
HEADERS = {
    "Accept": "application/json",
    "Content-Type": "application/json"
}

IMPACT_LEVELS = ["Medium", "High"]

date = datetime.now()
date_str = date.strftime("%d %b %Y")
scan_name = f'{date_str} - Astra Scan Results'

def check_results(scan_result):
    """
    Check if there are any significant vulnerabilities
    """
    vulnerabilities = [vulnerability for sublist in scan_result for vulnerability in sublist]
    for vulnerability in vulnerabilities:
        if vulnerability["impact"] in IMPACT_LEVELS:
            print('Issues found!')
            return True
    
    return False

def format_ticket(scan_results):
    """
    Converts vulnerabilities into format that can be posted to Jira.
    """
    description = 'See attached scan results for more details'
    for sublist in scan_results:
        for vulnerability in sublist:
            if vulnerability["impact"] in IMPACT_LEVELS:
                description += f'\n\n*Name: {vulnerability["name"]}*\n'
                description += f'Impact: {vulnerability["impact"]}\n'
                description += f'Description: {vulnerability["Description"]}\n'
                description += f'Remediation: {vulnerability["remediation"]}\n'
                description += f'URL: {vulnerability["url"]}\n'

    return {'summary': scan_name, 'description': description}

def filter_vulnerabilities(scan_results):
    """
    Filter vulnerabilities with medium and high severity to attach.
    """
    filtered_vulnerabilities = []

    for sublist in scan_results:
        for vulnerability in sublist:
            if vulnerability["impact"] in IMPACT_LEVELS:
                filtered_vulnerabilities.append(vulnerability)

    filtered_vulnerabilities_json = json.dumps(filtered_vulnerabilities, indent=4)
    filtered_vulnerabilities_bytes = filtered_vulnerabilities_json.encode()

    return filtered_vulnerabilities_bytes

def post_request(ticket, scan_results_data):
    """
    Post issue request to Jira.
    """
    payload = json.dumps({
        "fields": {
            "project": {
                "key": "APS"
            },
            "summary": ticket['summary'],
            "description": ticket['description'],
            "issuetype": {
                "name": "Story"
            },
            "customfield_10014": "APS-908",
            "priority": {
                "id": "10000"
            }
        }
    })

    post_url = JIRA_API_URL + '/issue'

    response = requests.post(url=post_url, data=payload,
                             headers=HEADERS, auth=JIRA_AUTH)

    print(response.text)

    if response.status_code != 201:
        print("Error occurred while creating Jira issue:", response.text)
        return

    # Attach scan results to the Jira issue
    issue_key = response.json().get('key')
    attach_url = f"{JIRA_API_URL}/issue/{issue_key}/attachments"
    headers = {"X-Atlassian-Token": "nocheck"}
    filename = scan_name + '.json'
    attach_response = requests.post(url=attach_url, files={'file': (filename, scan_results_data)}, headers=headers, auth=JIRA_AUTH)

    if attach_response.status_code == 200:
        print("Jira issue created and file attached successfully!")
    else:
        print("Error occurred while attaching file to Jira issue:", attach_response.text)

def main():
    with open(ASTRA_SCAN_RESULTS, "r") as file:
        scan_results = json.load(file)
    vulnerabilities = check_results(scan_results)
    
    if vulnerabilities:
        ticket_data = {}
        ticket_data = format_ticket(scan_results)
        filtered_vulnerabilities = filter_vulnerabilities(scan_results)
        post_request(ticket_data, filtered_vulnerabilities)
        sys.exit(1)

if __name__ == '__main__':
    main()
