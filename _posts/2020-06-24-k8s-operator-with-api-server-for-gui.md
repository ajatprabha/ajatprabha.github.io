---
layout: post
current: post
cover:  assets/images/k8s-banner.jpg
navigation: True
title: Writing Kubernetes Operator with an API Server for Custom GUI
date: 2020-06-24 12:00:00
tags: [kubernetes,golang]
class: post-template
subclass: 'post tag-k8s'
author: ajatprabha
---

If you have read my previous blog posts, I worked on an image proxy called [Darkroom](https://github.com/gojek/darkroom){:target="blank"} which manipulates the images on the fly. I also started learning more about [Kubernetes](http://kubernetes.io/){:target="blank"} and then I thought I should build something to get a deeper understanding of K8S. So the task that I took up is to create a GUI that is simple to use and it deploys `Darkroom` on-demand and everything else should happen without manually running `kubectl` commands.  

### Background  
Before starting off, let me tell you about the current state of `Darkroom`. It is a stateless application, configurable via environment variables and it has first-class support for containerization and the image size is less than 20MB. These are some of the reasons that I decided to pick this for the hands-on as the complexity to deploy is quite less. However, any application that follows the [Twelve Factor App](https://12factor.net/){:target="blank"} principles should be a good candidate.

### Why make an operator?  
There can be many ways on how you manage your workloads on K8S viz.
1. Applying manifests via `kubectl` or `kustomize`
2. Using `helm` as a package manager to install and upgrade apps
3. Use custom `operator` to make the system smart enough work on its own
	* Operators can install, upgrade, maintain lifecycle, provide insights of workloads, they can essentially put your workload on auto-pilot  

Now moving back to Darkroom, in order to deploy this on Kubernetes, a simple deployment is enough. We can apply a `Deployment` manifest with the following command.  
```shell
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: darkroom-deployment
  labels:
    app: darkroom
spec:
  replicas: 1
  selector:
    matchLabels:
      app: darkroom
  template:
    metadata:
      labels:
        app: darkroom
    spec:
      containers:
      - name: darkroom
        image: gojektech/darkroom
        ports:
        - containerPort: 3000
        env:
        - name: SOURCE_KIND
          value: WebFolder
        - name: SOURCE_BASEURL
          value: https://ajatprabha.in/assets
EOF
```  
Use port-forwarding now to access the application  
```shell
kubectl port-forward $(kubectl get pods -l app=darkroom -o=jsonpath='{.items[0].metadata.name}') 3000:3000
```
You should be able to see this image `http://localhost:3000/images/IMG_20180604_125819.jpg?w=512` now, and change its width, height, etc by changing the query parameters.
##### Say Hello to Operators (CRD + Controller)  
With the help of `CustomResourceDefinition` aka CRD, we can create our own custom APIs and extend the funcitonality of Kubernetes.
We can then create a controller which will work on this CRD! An overview of this is shown in this diagram:  

<img src="/assets/images/operator-diagram.svg" alt="Operator Darkroom" style="max-width: 1100px"/>

Since operator runs in background we can create these CRDs from anywhere via the kube-api-server, we will create our own api-server to talk to the `kube-api-server` later in this post and add a nice GUI to expose it.

> Note: All the code for this example can be found at [github.com/ajatprabha/operator-example](https://github.com/ajatprabha/operator-example)

## Prepare Environment  
First off, we need to have a working kubernetes development cluster running locally, [minikube](https://minikube.sigs.k8s.io/){:target="blank"} is a really good option for that. Install it(`brew install minikube`) and start a local cluster with `minikube start --driver=kvm2`(I prefer to use KVM, but you may use --driver=none).  

```shell
😄  minikube v1.11.0 on Ubuntu 20.04
✨  Using the kvm2 driver based on user configuration
💾  Downloading driver docker-machine-driver-kvm2:
    > docker-machine-driver-kvm2.sha256: 65 B / 65 B [-------] 100.00% ? p/s 0s
    > docker-machine-driver-kvm2: 13.88 MiB / 13.88 MiB  100.00% 739.31 KiB p/s
💿  Downloading VM boot image ...
    > minikube-v1.11.0.iso.sha256: 65 B / 65 B [-------------] 100.00% ? p/s 0s
    > minikube-v1.11.0.iso: 174.99 MiB / 174.99 MiB  100.00% 743.99 KiB p/s 4m1
👍  Starting control plane node minikube in cluster minikube
💾  Downloading Kubernetes v1.18.3 preload ...
    > preloaded-images-k8s-v3-v1.18.3-docker-overlay2-amd64.tar.lz4: 526.01 MiB
🔥  Creating kvm2 VM (CPUs=2, Memory=3900MB, Disk=20000MB) ...
🐳  Preparing Kubernetes v1.18.3 on Docker 19.03.8 ...
🔎  Verifying Kubernetes components...
🌟  Enabled addons: default-storageclass, storage-provisioner
🏄  Done! kubectl is now configured to use "minikube"
```

Next, we need to install [kubebuilder](https://book.kubebuilder.io/){:target="blank"} which will help us in scaffolding operator for K8S. To test your installation, run `kubebuilder version` which should exit without errors.


## Setup  
Now we can inititialize a blank repository to start working on.
```shell
mkdir operator-example
cd operator-example
git init && git add --all && git commit -m "init"
```  

Use kubebuider to initialize a new operator project
```shell
go mod init github.com/ajatprabha/operator-example
kubebuilder init --domain example.com
git add --all && git commit -m "kubebuilder init"
```  
> You should change the module name from `github.com/ajatprabha/operator-example` to something else. The domain should also be unique to your organisation.

### API Definition  
Once the initial scaffolding is done, we can start defining our APIs. Kubernetes has a set of internal APIs for different kinds viz. `Pod`, `Service`, `ConfigMap`, etc. We will create a new CRD called `Darkroom` which will be responsible for this automation that we want to achieve.  
```shell
kubebuilder create api --group deployments --version v1alpha1 --kind Darkroom
    Create Resource [y/n] y
    Create Controller [y/n] y
    Writing scaffold for you to edit...
    api/v1alpha1/darkroom_types.go
    controllers/darkroom_controller.go
git add --all && git commit -m "scaffold resource and controller"
```

#### Modifying Resource  
Once the resources is generated, fire up your favourite IDE and take a look at the `api/v1alpha1/darkroom_types.go` file. Here you can see a typed definitions for the resource `Darkroom`.
```go
// DarkroomSpec defines the desired state of Darkroom
type DarkroomSpec struct {
	// INSERT ADDITIONAL SPEC FIELDS - desired state of cluster
	// Important: Run "make" to regenerate code after modifying this file

	// Foo is an example field of Darkroom. Edit Darkroom_types.go to remove/update
	Foo string `json:"foo,omitempty"`
}

// DarkroomStatus defines the observed state of Darkroom
type DarkroomStatus struct {
	// INSERT ADDITIONAL STATUS FIELD - define observed state of cluster
	// Important: Run "make" to regenerate code after modifying this file
}

// +kubebuilder:object:root=true

// Darkroom is the Schema for the darkrooms API
type Darkroom struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   DarkroomSpec   `json:"spec,omitempty"`
	Status DarkroomStatus `json:"status,omitempty"`
}

// +kubebuilder:object:root=true

// DarkroomList contains a list of Darkroom
type DarkroomList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []Darkroom `json:"items"`
}
```  
> Notice the comments such as `+kubebuilder:object:root=true`, KubeBuilder makes use of a tool called controller-gen for generating utility code and Kubernetes YAML. This code and config generation is controlled by the presence of special "marker comments" in Go code.  

Now let's modify these Go structs to hold information that we care about.  
```go
// +kubebuilder:validation:Enum=WebFolder;S3
type Type string

const (
	WebFolder Type = "WebFolder"
	S3        Type = "S3"
)

type WebFolderMeta struct {
	BaseURL string `json:"baseUrl,omitempty"`
}

type S3Meta struct {
	AccessKey  string `json:"accessKey,omitempty"`
	SecretKey  string `json:"secretKey,omitempty"`
	Region     string `json:"region,omitempty"`
	PathPrefix string `json:"pathPrefix,omitempty"`
}

type Source struct {
	// Specifies storage backend to use with darkroom.
	// Valid values are:
	// - "WebFolder" (default): simple storage backend to serve images from a hosted image source;
	// - "S3": storage backend to serve images from an S3 bucket;
	Type Type `json:"type"`
	// +optional
	WebFolderMeta `json:",inline"`
	// +optional
	S3Meta `json:",inline"`
}

// DarkroomSpec defines the desired state of Darkroom
type DarkroomSpec struct {
	// +optional
	Version string `json:"version"`
	Source Source `json:"source"`
	// +kubebuilder:validation:MinItems=1
	SubDomains []string `json:"subDomains"`
}

// DarkroomStatus defines the observed state of Darkroom
type DarkroomStatus struct {
	// +optional
	Domains []string `json:"domains,omitempty"`
}

// +kubebuilder:object:root=true
// +kubebuilder:subresource:status
// +kubebuilder:printcolumn:JSONPath=".spec.version",name=VERSION,type=string
// +kubebuilder:printcolumn:JSONPath=".spec.source.type",name=TYPE,type=string
// +kubebuilder:resource:shortName=dr

// Darkroom is the Schema for the darkrooms API
type Darkroom struct {
	/* ... */
}

```  

Run `make manifests` to generate YAMLs for this CRD, kubebuilder will use the marker comments to add utilities, validation, etc. `printcolumn` will specify what fields to show when we do `kubectl get darkrooms`, yes now we can use kubectl to interact with this new Kind.

Now update the sample manifest to define a `Darkroom` object, just as you would define a `Pod` or `Service`
```yaml
apiVersion: deployments.example.com/v1alpha1
kind: Darkroom
metadata:
  name: darkroom-sample
spec:
  source:
    baseUrl: https://ajatprabha.in/assets
    type: WebFolder
  subDomains:
    - ajatprabha
  version: 0.1.0
```  
> Note: I've used my blog's address, you can modify it according to your usecase.

Install the CRD manifest in the cluster and then apply this new Darkroom manifest with `kubectl apply -f config/samples/deployments_v1alpha1_darkroom.yaml`
```shell
git add --all && git commit -m "update CRD definition and manifests"

make install
/usr/local/go/bin/controller-gen "crd:trivialVersions=true" rbac:roleName=manager-role webhook paths="./..." output:crd:artifacts:config=config/crd/bases
kustomize build config/crd | kubectl apply -f -
customresourcedefinition.apiextensions.k8s.io/darkrooms.deployments.example.com created

kubectl apply -f config/samples/deployments_v1alpha1_darkroom.yaml
darkroom.deployments.example.com/darkroom-sample created

kubectl get darkrooms                                             
NAME              VERSION   TYPE
darkroom-sample   0.1.0     WebFolder
```  

Okay, great! We can now persist our new Darkroom objects in Kubernetes' object store.

## Implementing Controller
Now, we will look at how we can implement the controller to act upon these Darkroom objects and work towards matching the current state with the desired state in a reconciliation loop.  
We've already seen in the starting of this blog post that how we can use the K8S internal APIs to accomplish a simple Darkroom deployment using `kubectl`.  
Any deployment inside K8S requires an image for the `Pod`, since our application reads configuration from environment variables, we can inject these values in the `Pod` from a `ConfigMap`, finally we expose this `Pod` via a `Service` within the cluster and update the `Ingress` to allow external traffic to this Service.  

Take a look at the controller code in the `controllers/darkroom_controller.go` file.
```go
func (r *DarkroomReconciler) Reconcile(req ctrl.Request) (ctrl.Result, error) {
	_ = context.Background()
	_ = r.Log.WithValues("darkroom", req.NamespacedName)

	// your logic here

	return ctrl.Result{}, nil
}

func (r *DarkroomReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&deploymentsv1alpha1.Darkroom{}).
		Complete(r)
}
```  
We will write our reconciliation logic here, but before we do that, let's run the controller once and see what happens.
```shell
make run
/usr/local/go/bin/controller-gen object:headerFile="hack/boilerplate.go.txt" paths="./..."
go fmt ./...
go vet ./...
/usr/local/go/bin/controller-gen "crd:trivialVersions=true" rbac:roleName=manager-role webhook paths="./..." output:crd:artifacts:config=config/crd/bases
go run ./main.go
2020-06-24T22:58:27.059+0530	INFO	controller-runtime.metrics	metrics server is starting to listen	{"addr": ":8080"}
2020-06-24T22:58:27.059+0530	INFO	setup	starting manager
2020-06-24T22:58:27.060+0530	INFO	controller-runtime.manager	starting metrics server	{"path": "/metrics"}
2020-06-24T22:58:27.060+0530	INFO	controller-runtime.controller	Starting EventSource	{"controller": "darkroom", "source": "kind source: /, Kind="}
2020-06-24T22:58:27.161+0530	INFO	controller-runtime.controller	Starting Controller	{"controller": "darkroom"}
2020-06-24T22:58:27.161+0530	INFO	controller-runtime.controller	Starting workers	{"controller": "darkroom", "worker count": 1}
2020-06-24T22:58:27.161+0530	DEBUG	controller-runtime.controller	Successfully Reconciled	{"controller": "darkroom", "request": "default/darkroom-sample"}
```  

As you can see, it picked up our created Darkroom object named `darkroom-sample`, nothing actually happened since their is no logic in the controller yet.  
We will first tell the controller manager that what objects this controller interacts with and what is the type of interaction.  

```go
func (r *DarkroomReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&v1alpha1.Darkroom{}).
		Owns(&corev1.ConfigMap{}).
		Owns(&corev1.Service{}).
		Owns(&appsv1.Deployment{}).
		Owns(&v1beta12.Ingress{}).
		Complete(r)
}
```  
> Here we have specified that this controller is for `v1alpha1.Darkroom`, and it owns `Deployment`, `ConfigMap`, `Service` and `Ingress`.  

Now for the actual reconciliation logic, we have to keep in mind that the loop should be `idempotent`. This is very important. The logic invloves 4 simple steps for now:
1. Create spec for desired `ConfigMap`
2. Create spec for desired `Deployment` which takes environment variables from the above ConfigMap
3. Create spec for desired `Service` for above Deployment
4. Create spec for desired `Ingress` for routing external traffic to above Service

```go
func (r *DarkroomReconciler) Reconcile(req ctrl.Request) (ctrl.Result, error) {
    ctx := context.Background()
    r.Log.WithValues("darkroom", req.NamespacedName)

    var darkroom deploymentsv1alpha1.Darkroom
    if err := r.Get(ctx, req.NamespacedName, &darkroom); err != nil {
        return ctrl.Result{}, client.IgnoreNotFound(err)
    }

    cfg, err := r.desiredConfigMap(darkroom)
    if err != nil {
        return ctrl.Result{}, err
    }

    deployment, err := r.desiredDeployment(darkroom, cfg)
    // purposely hide repeating error return code
    if err != nil { /* ... */ }
    svc, err := r.desiredService(darkroom)
    if err != nil { /* ... */ }
    ingr, err := r.desiredIngress(darkroom, svc)
    if err != nil { /* ... */ }

    applyOpts := []client.PatchOption{client.ForceOwnership, client.FieldOwner("darkroom-controller")}

    err = r.Patch(ctx, &cfg, client.Apply, applyOpts...)
    if err != nil { /* ... */ }
    err = r.Patch(ctx, &deployment, client.Apply, applyOpts...)
    if err != nil { /* ... */ }
    err = r.Patch(ctx, &svc, client.Apply, applyOpts...)
    if err != nil { /* ... */ }
    err = r.Patch(ctx, &ingr, client.Apply, applyOpts...)
    if err != nil { /* ... */ }

    darkroom.Status.Domains = domainsForService(ingr)
    err = r.Status().Update(ctx, &darkroom)
    if err != nil { /* ... */ }

    return ctrl.Result{}, nil
}
```  

The above code might feel repitive since we want to achieve idempotency. However, it can be refactored better but that is out of scope for this demo.  
The actual implementation of `desiredConfigMap`, `desiredDeployment`, `desiredService` and `desiredIngress` can be found in [helpers.go](https://github.com/ajatprabha/operator-example/blob/master/controllers/helpers.go){:target="blank"}  
We can now run the controller and it will work as expected.  

<video width="720" controls>
    <source src="/assets/videos/operator-ex-01.mp4" type="video/mp4">
    Your browser does not support the video tag.
</video>  

At this point, we can build and push the controller to an image registry with `make docker-build && make docker-push` and then deploy the controller to the K8S cluster with `make deploy`

## API Server and GUI  
Now we can finally create a custom api-server with a GUI to perform CRUD on `Darkroom` CRD, we do not need to use `kubectl` after this. Some of the trivial code is not explained and commented out, it can be found in the package `api_server`

```go
// main.go

func init() {
  // Initialize the scheme so that kubernetes dynamic client knows
  // how to work with new CRD and native kubernetes types
	_ = clientgoscheme.AddToScheme(scheme)
	_ = deploymentsv1alpha1.AddToScheme(scheme)
}

func main() {
	/* ... */

	mgr, err := apiserver.NewManager(ctrl.GetConfigOrDie(), apiserver.Options{
		Scheme:         scheme,
		Port:           5000,
		AllowedDomains: []string{},
	})
	if err != nil { /* ... */ }

	runLog.Info("starting api-server manager")
	if err := mgr.Start(signals.SetupSignalHandler()); err != nil { /* ... */ }
}
```  
> Note: Registering the types with scheme in `init` function is the key here. Without this, the K8S dynamic client cannot work.

Now we will create an API Server `Manager` that will create the K8S client and keep a reference to it. It will also create a cache that will be used to create a cached K8S client, initialize the cache properly and in the end handle the termination signals.  

```go
// manager.go

// Options to customize Manager behaviour and pass information
type Options struct {
	Scheme         *runtime.Scheme
	Namespace      string
	Port           int
	AllowedDomains []string
}

type Manager interface {
	Start(stop <-chan struct{}) error
}

type manager struct { /* ... */ }

func NewManager(config *rest.Config, options Options) (Manager, error) {
	mapper, err := apiutil.NewDynamicRESTMapper(config)
	if err != nil { /* ... */ }
  
	// we use cache to optimize fetch from the kube-api-server
	cc, err := cache.New(config, cache.Options{
		Scheme:    options.Scheme,
		Mapper:    mapper,
		Resync:    &defaultRetryPeriod,
		Namespace: options.Namespace,
	})
	if err != nil { /* ... */ }

	c, err := client.New(config, client.Options{Scheme: options.Scheme, Mapper: mapper})
	if err != nil { /* ... */ }

	stop := make(chan struct{})
	return &manager{
		config: config,
		cache:  cc,
		client: &client.DelegatingClient{
			Reader: &client.DelegatingReader{
				CacheReader:  cc,
				ClientReader: c,
			},
			Writer:       c,
			StatusClient: c,
		},
		internalStop:    stop,
		internalStopper: stop,
		port:            options.Port,
		allowedDomains:  options.AllowedDomains,
	}, nil
}

func (m *manager) Start(stop <-chan struct{}) error {
	defer close(m.internalStopper)
	// initialize this here so that we reset the signal channel state on every start
	m.errSignal = &errSignaler{errSignal: make(chan struct{})}
	m.waitForCache()

	srv, err := newApiServer(m.port, m.allowedDomains, m.client)
	if err != nil { /* ... */ }

	go func() {
		if err := srv.Start(m.internalStop); err != nil {
			m.errSignal.SignalError(err)
		}
	}()
	select {
	case <-stop:
		return nil
	case <-m.errSignal.GotError():
		// Error starting the cache
		return m.errSignal.Error()
	}
}

// start cache in separate goroutine
func (m *manager) waitForCache() {
	if m.started {
		return
	}

	go func() {
		if err := m.cache.Start(m.internalStop); err != nil {
			m.errSignal.SignalError(err)
		}
	}()

	// Wait for the caches to sync.
	m.cache.WaitForCacheSync(m.internalStop)
	m.started = true
}
```  

The server uses `go-restful` to provide RESTful endpoints to a JavaScript based GUI.  
```go
// server.go
type apiServer struct {
	server *http.Server
}

func (as *apiServer) Address() string {
	return as.server.Addr
}

func init() {
	restful.MarshalIndent = func(v interface{}, prefix, indent string) ([]byte, error) {
		var buf bytes.Buffer
		encoder := restful.NewEncoder(&buf)
		encoder.SetIndent(prefix, indent)
		if err := encoder.Encode(v); err != nil { /* ... */ }
		return buf.Bytes(), nil
	}
}

func newApiServer(port int, allowedDomains []string, client client.Client) (*apiServer, error) {
	container := restful.NewContainer()
	srv := &http.Server{
		Addr:    fmt.Sprintf(":%d", port),
		Handler: container.ServeMux,
	}

	cors := restful.CrossOriginResourceSharing{
		ExposeHeaders:  []string{restful.HEADER_AccessControlAllowOrigin},
		AllowedDomains: allowedDomains,
		Container:      container,
	}

	ws := new(restful.WebService)
	ws.
		Path("/").
		Consumes(restful.MIME_JSON).
		Produces(restful.MIME_JSON)

	addEndpoints(ws, client)
	container.Add(ws)
	container.Filter(cors.Filter)
	return &apiServer{
		server: srv,
	}, nil
}

func addEndpoints(ws *restful.WebService, client client.Client) {
	resources := []endpoints.Endpoint{
		endpoints.NewDarkroomEndpoint(client),
	}
	for _, ep := range resources {
		ep.SetupWithWS(ws)
	}
}

func (as *apiServer) Start(stop <-chan struct{}) error {
	errChan := make(chan error)
	go func() {
		err := as.server.ListenAndServe()
		if err != nil { /* ... */ }
	}()
	log.Info("Starting api-server", "interface", "0.0.0.0", "port", as.Address())
	select {
	case <-stop:
		log.Info("Shutting down api-server")
		return as.server.Shutdown(context.Background())
	case err := <-errChan:
		return err
	}
}
```  

Finally, in the `DarkroomEndpoint` we have the reference to the K8S client and we can use it perform operations on the Darkroom CRD.
For example, list, create, edit and delete Darkrooms!  

```go
// endpoints/darkroom.go

type DarkroomEndpoint struct {
	client client.Client
}

func NewDarkroomEndpoint(client client.Client) *DarkroomEndpoint {
	return &DarkroomEndpoint{client: client}
}

func (de *DarkroomEndpoint) SetupWithWS(ws *restful.WebService) { /* route paths to handler funcions */ }

func (de *DarkroomEndpoint) list(request *restful.Request, response *restful.Response) {
	dl := new(v1alpha1.DarkroomList)
	err := de.client.List(request.Request.Context(), dl, &client.ListOptions{})
	if err != nil { /* ... */ } else {
		l := From.List(dl)
		if err := response.WriteAsJson(l); err != nil { /* ... */ }
	}
}

func (de *DarkroomEndpoint) create(request *restful.Request, response *restful.Response) {
	d := new(Darkroom)
	err := request.ReadEntity(d)
	if err != nil { /* return error */ }

	if err := d.Validate(); err != nil { /* ... */ }
	obj := &v1alpha1.Darkroom{ /* fill all common values */ }

	// Use obj.Spec.Source.Type to populate other values like 

	err = de.client.Create(request.Request.Context(), obj, &client.CreateOptions{})
	if err != nil { /* return error */ } else {
		d := From.Object(obj)
		if err := response.WriteAsJson(d); err != nil { /* return error */ }
	}
}
```  

Fire up the server now with `go run ./api-server/cmd/main.go` or with make target(if defined) `make api`
```shell
make api
/use/local/go/bin/controller-gen object:headerFile="hack/boilerplate.go.txt" paths="./..."
go fmt ./...
go vet ./...
go run ./api-server/cmd/main.go
2020-06-25T00:37:44.391+0530	INFO	darkroom-cp.run	starting api-server manager
2020-06-25T00:37:44.392+0530	INFO	api-server	Starting api-server	{"interface": "0.0.0.0", "port": ":5000"}
```  

And then test it with curl to list the current Darkroom CRD instances
```shell
curl localhost:5000/darkrooms
{
 "items": [
  {
   "name": "darkroom-sample",
   "version": "0.1.0",
   "source": {
    "type": "WebFolder",
    "baseUrl": "https://ajatprabha.in/assets"
   },
   "status": {
    "domains": [
     "ajatprabha.darkroom.example.com"
    ]
   }
  }
 ]
}
```  

The new API server can also be used to create new Darkroom instances.  

<video width="720" controls>
    <source src="/assets/videos/operator-ex-02.mp4" type="video/mp4">
    Your browser does not support the video tag.
</video>  

Now you can connect this to a GUI, I will include the [GUI code in the repo](https://github.com/ajatprabha/operator-example/tree/master/gui){:target="blank"} but won't go through it as it's out of scope of this blog post.  

<img src="/assets/images/Screenshot-2020-06-25 01-31-09.png" alt="Darkroom list" style="max-width: 1400px"/>  
<img src="/assets/images/Screenshot-2020-06-25 01-31-37.png" alt="Add new Darkroom" style="max-width: 1100px"/>  

And this concept of leveraging K8S using operators and a custom GUI can be used to create many solutions. If you can do it manually, you can automate it with operators!  

I hope this was an helpful post, feel free to drop your comments and queries.