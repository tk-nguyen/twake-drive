# Base image
FROM docker.io/onlyoffice/documentserver

# Expose ports
EXPOSE 80

# Environment variables
ENV AMQP_URI=amqp://guest:guest@onlyoffice-rabbitmq
ENV DB_HOST=onlyoffice-postgresql
ENV DB_NAME=onlyoffice
ENV DB_PORT=5432
ENV DB_TYPE=postgres
ENV DB_USER=onlyoffice
ENV JWT_ENABLED=false

# Startup command
CMD ["nginx", "-g", "daemon off;"]