#!/bin/bash
cd /home/kavia/workspace/code-generation/itjobconnect-922-937/job_portal_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

