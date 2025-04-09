topk(25, sort_desc(sum(pod:container_fs_usage_bytes:sum{container="",pod!=""}) BY (pod, namespace)))

- '-images=monitoring-plugin=quay.io/openshift-release-dev/ocp-v4.0-art-dev@sha256:1695b41d66d3909bc3ba2d1ddd314ca38babcc75b11c9164bbfa94d150d9fc78'


const dataQueryTable = {
    "columns": [
        "",
        {
            "title": {
                "type": "span",
                "key": null,
                "ref": null,
                "props": {
                    "children": "pod"
                },
                "_owner": null
            },
            "transforms": [
                null,
                null
            ]
        },
        {
            "title": "Value",
            "transforms": [
                null,
                null
            ]
        }
    ],
    "rows": [
        [
            {
                "title": {
                    "key": null,
                    "ref": null,
                    "props": {
                        "index": 0,
                        "labels": {
                            "pod": "managed-serviceaccount-addon-agent-6479d6985b-qhb76"
                        }
                    },
                    "_owner": null
                }
            },
            "managed-serviceaccount-addon-agent-6479d6985b-qhb76",
            "0.6081716149720794"
        ],
        [
            {
                "title": {
                    "key": null,
                    "ref": null,
                    "props": {
                        "index": 0,
                        "labels": {
                            "pod": "cluster-proxy-proxy-agent-74bb4cdc76-c2b6r"
                        }
                    },
                    "_owner": null
                }
            },
            "cluster-proxy-proxy-agent-74bb4cdc76-c2b6r",
            "0.7050712905415992"
        ],
        [
            {
                "title": {
                    "key": null,
                    "ref": null,
                    "props": {
                        "index": 0,
                        "labels": {
                            "pod": "etcd-operator-5d58b9f575-86m2f"
                        }
                    },
                    "_owner": null
                }
            },
            "etcd-operator-5d58b9f575-86m2f",
            "26.836590895165735"
        ],
        [
            {
                "title": {
                    "key": null,
                    "ref": null,
                    "props": {
                        "index": 0,
                        "labels": {
                            "pod": "openshift-kube-scheduler-operator-7679fdb5d7-x5dzd"
                        }
                    },
                    "_owner": null
                }
            },
            "openshift-kube-scheduler-operator-7679fdb5d7-x5dzd",
            "7.880910683012259"
        ]
    ]
}

promql matrix query = (container_network_receive_bytes_total[2h])

const rows = [
    [
        {
            "title": {
                "key": null,
                "ref": null,
                "props": {
                    "index": 0,
                    "labels": {
                        "pod": "klusterlet-addon-workmgr-58db6fb47-cxg7h"
                    }
                },
                "_owner": null
            }
        },
        "klusterlet-addon-workmgr-58db6fb47-cxg7h",
        "0.005692437031307798"
    ],
    [
        {
            "title": {
                "key": null,
                "ref": null,
                "props": {
                    "index": 0,
                    "labels": {
                        "pod": "cluster-proxy-proxy-agent-db644d-zdrrg"
                    }
                },
                "_owner": null
            }
        },
        "cluster-proxy-proxy-agent-db644d-zdrrg",
        "0.0007680598677396036"
    ],
    [
        {
            "title": {
                "key": null,
                "ref": null,
                "props": {
                    "index": 0,
                    "labels": {
                        "pod": "managed-serviceaccount-addon-agent-846457cc6-jc4f4"
                    }
                },
                "_owner": null
            }
        },
        "managed-serviceaccount-addon-agent-846457cc6-jc4f4",
        "0.00046417785234899414"
    ]
]
 

  const csvVal = _.map(values, ([time, v]) => `${v}@${time}`);