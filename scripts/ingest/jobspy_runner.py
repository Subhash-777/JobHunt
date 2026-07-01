import sys
import json
import logging
from jobspy import scrape_jobs

logging.basicConfig(level=logging.ERROR)

def main():
    search_term = sys.argv[1] if len(sys.argv) > 1 else "software engineer"
    try:
        jobs = scrape_jobs(
            site_name=["indeed", "linkedin", "naukri"],
            search_term=search_term,
            location="India",
            results_wanted=20,
            hours_old=24,
            country_indeed='India'
        )
        print(jobs.to_json(orient="records"))
    except Exception as e:
        print(json.dumps([]))
        sys.exit(1)

if __name__ == "__main__":
    main()
