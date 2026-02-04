import { useMemo } from 'react';
import { K8sResourceKind, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { ProjectModel } from '../../../console/models';

export const useAllAccessibleProjects = () => {
  const [allProjects, projectsLoaded] = useK8sWatchResource<K8sResourceKind[]>({
    isList: true,
    kind: ProjectModel.kind,
    optional: true,
  });

  const whatIsThis = ProjectModel.kind;

  console.log('!JZ useAllAccessibleProjects', { allProjects, projectsLoaded, whatIsThis });

  const memoizedAllProjects = useMemo(() => {
    return allProjects || [];
  }, [allProjects]);

  const result = useMemo(
    () => ({
      allProjects: memoizedAllProjects,
      projectsLoaded,
    }),
    [memoizedAllProjects, projectsLoaded],
  );

  return result;
};
