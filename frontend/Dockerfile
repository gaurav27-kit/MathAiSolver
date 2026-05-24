# Frontend Dockerfile
FROM nginx:alpine

# Copy frontend files to nginx html directory
COPY *.html /usr/share/nginx/html/
COPY src /usr/share/nginx/html/src/

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
