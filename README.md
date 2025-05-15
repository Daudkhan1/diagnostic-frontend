# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh


@author Salman Mesam
# Running locally using front end as a docker container

Sample Command to build image : 
 docker build -t salmanlocal --build-arg BUILD_ENV=development .

Sample Command to run built image as a docker container : 
 docker run -d -p 5173:5173 --name salmanlocal salmanlocal

 Environment Variables set in .env.development : 
 VITE_BACKEND_URL=http://localhost:8080   (this is when springboot app is running locally on ur intellij)
 VITE_CANTALOUPE_SERVER=http://localhost:8182/ (canttaloupe  container running on docker )


To see if your container for front end is working as expected :
Do "docker ps" to list containers up
Then run "docker logs ContainerID" using container id shown for front end docker container
U should see : 

> react-dashboard@0.0.0 dev
> vite

Forced re-optimization of dependencies

  VITE v5.4.3  ready in 1775 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://172.17.0.2:5173/

Please note that commands need to be exact at this point in time
Only 3 commands support right now : 
1) development
2) test
3) production  