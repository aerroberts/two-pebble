export interface ProjectsDeleteOperation {
  name: 'deleteProject';
  request: {
    id: string;
  };
  response: {
    id: string;
  };
}
