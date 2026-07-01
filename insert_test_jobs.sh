#!/bin/bash
curl -s -X POST "https://xvityaqxxabpouuckkac.supabase.co/rest/v1/jobs" \
-H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2aXR5YXF4eGFicG91dWNra2FjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgzOTg1OCwiZXhwIjoyMDk4NDE1ODU4fQ.ZR7fMWYM1zue_wggn4DxlkHj0L83SxuAXUWf-3n5seE" \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2aXR5YXF4eGFicG91dWNra2FjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgzOTg1OCwiZXhwIjoyMDk4NDE1ODU4fQ.ZR7fMWYM1zue_wggn4DxlkHj0L83SxuAXUWf-3n5seE" \
-H "Content-Type: application/json" \
-H "Prefer: return=representation" \
-d '[
  {
    "title": "Frontend Developer",
    "company": "Swiggy",
    "source_type": "ats",
    "source_name": "greenhouse",
    "source_url": "https://swiggy.com/jobs/1",
    "canonical_apply_url": "https://swiggy.com/jobs/1",
    "role_category": "Frontend",
    "ctc_bucket": "10-20",
    "work_mode": "hybrid",
    "description": "React developer needed"
  },
  {
    "title": "Backend Go Engineer",
    "company": "Zomato",
    "source_type": "ats",
    "source_name": "lever",
    "source_url": "https://zomato.com/jobs/2",
    "canonical_apply_url": "https://zomato.com/jobs/2",
    "role_category": "Backend",
    "ctc_bucket": "20+",
    "work_mode": "remote",
    "description": "Golang expert needed"
  },
  {
    "title": "Data Scientist",
    "company": "Flipkart",
    "source_type": "india_platform",
    "source_name": "naukri",
    "source_url": "https://flipkart.com/jobs/3",
    "canonical_apply_url": "https://flipkart.com/jobs/3",
    "role_category": "Data",
    "ctc_bucket": "5-10",
    "work_mode": "onsite",
    "description": "ML expert needed"
  },
  {
    "title": "Fullstack Intern",
    "company": "Razorpay",
    "source_type": "github_list",
    "source_name": "summer2024",
    "source_url": "https://razorpay.com/jobs/4",
    "canonical_apply_url": "https://razorpay.com/jobs/4",
    "role_category": "Fullstack",
    "ctc_bucket": "<5",
    "work_mode": "remote",
    "description": "Internship"
  }
]'
