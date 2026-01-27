import { K8sResourceKind, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { ProjectModel } from '../../../console/models';

export const useAllAccessibleProjects = () => {
  const [allProjects, projectsLoaded] = useK8sWatchResource<K8sResourceKind[]>({
    isList: true,
    kind: ProjectModel.kind,
    optional: true,
  });

  return {
    allProjects: allProjects || [],
    projectsLoaded,
  };
};
