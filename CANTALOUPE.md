# Project Setup with Cantaloupe and OpenSeaDragon

This guide provides detailed instructions on setting up Cantaloupe as an IIIF image server with OpenSeaDragon for viewing high-resolution images. The setup is containerized using Docker to ensure consistency across different environments.

## Directory Structure
**Note**: In this structure the `docker/` folder doesn't necessarily need to be put in the `front-end` files, it can be anywhere in your system.
```
project-root/
│
├── docker/
│   ├── docker-compose.yml        # Docker compose file to orchestrate containers
│   └── images/                   # Directory for storing images (User provided)
│
├── src/                          # Source code for the frontend application
│   └── ...                       # Other frontend files
│
└── README.md                     # Documentation file

```

### Important Directories

- **`docker/`**: Contains the `docker-compose.yml` and a mountable volume directory (`images/`) that users need to populate with their image files.
- **`images/`**: This is a user-populated directory that needs to contain all the image files you want to serve with Cantaloupe. This directory is referenced in the Docker compose file as a mounted volume.

## Docker Compose Setup

The `docker-compose.yml` file is configured to set up the Cantaloupe server. Here’s an overview of the setup:

```yaml
version: '3.8'

services:
  cantaloupe:
    image: islandora/cantaloupe:3.4.1
    container_name: cantaloupe_image_server
    ports:
      - "8182:8182"  # Expose port 8182 for Cantaloupe
    environment:
      - CANTALOUPE_HEAP_MIN=3G
      - CANTALOUPE_HEAP_MAX=5G
      - CANTALOUPE_HTTP_PORT=8182
      - CANTALOUPE_FILESYSTEMCACHE_PATHNAME=/data/cache
      - CANTALOUPE_FILESYSTEMSOURCE_BASICLOOKUPSTRATEGY_PATH_PREFIX=/cantaloupe/images/
      - CANTALOUPE_SOURCE_STATIC=FilesystemSource
      - CANTALOUPE_PROCESSOR_FALLBACK_RETRIEVAL_STRATEGY=StreamStrategy
      - CANTALOUPE_PROCESSOR_MANUALSELECTIONSTRATEGY_TIF=JaiProcessor
    volumes:
      - ./images:/cantaloupe/images   # User-provided images
      - ./cache:/data/cache           # Cache storage
    restart: unless-stopped

```
### Run Cantaloupe
* To run the cantaloupe server simple go inside the folder `cd docker` and run the command
```
docker-compose up -d
```

### Configuration Explained


  * **Ports**: `8182` is the port used by Cantaloupe. It must be exposed to the host for web access to the IIIF server.
  * **Environment Variables**: Used to configure Cantaloupe's behavior, such as memory allocation `(CANTALOUPE_HEAP_MIN, CANTALOUPE_HEAP_MAX)`, and the path settings for images and cache.
  * **Volumes**:
      * `./images:/cantaloupe/images:` Mounts the local images directory to the container. This directory should contain the images you wish to serve via Cantaloupe.
      * `./cache:/data/cache:` Used by Cantaloupe for caching, improving performance for frequent access.
  


## Using Cantaloupe with OpenSeaDragon
  OpenSeaDragon is used on the client side to fetch and display images served by Cantaloupe. Here’s how you integrate OpenSeaDragon in your project:
  
  ### Hardcoded Values
  * **Cantaloupe URL**: It's hardcoded to `http://localhost:8182/iiif/2/` in development. This value should be changed in production to match your deployed server's URL. It is used to compose URLs for the images.
  * **Meta Data Fetching**: OpenSeaDragon fetches image metadata from Cantaloupe using the IIIF info.json endpoint, which is constructed using the Cantaloupe URL and the image identifiers.  
## Integration Example
```
viewer.addTiledImage({
    tileSource: {
        '@context': 'http://iiif.io/api/image/2/context.json',
        '@id': 'http://localhost:8182/iiif/2/image-id/info.json',
        'protocol': 'http://iiif.io/api/image',
        ...
    }
});
```

**Note:** In the above configuration, only the image name (e.g., `image-id`) needs to be dynamically provided; the rest of the URL is a hardcoded value based on your Cantaloupe setup.
