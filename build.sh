# Test Docker file 
docker build --tag baby-logger:1.0 .

# Need to ensure cloud build is enabled.
gcloud builds submit --tag gcr.io/baby-logger-279914/web-server --project=baby-logger-279914
gcloud run deploy --image gcr.io/baby-logger-279914/web-server --project=baby-logger-279914 --platform managed