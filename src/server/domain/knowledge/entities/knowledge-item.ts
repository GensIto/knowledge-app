export interface KnowledgeItemProps {
  id: string;
  userId: string;
  url: string;
  title: string;
  summary: string;
  tags: string[];
  createdAt: Date;
}

export class KnowledgeItem {
  readonly id: string;
  readonly userId: string;
  readonly url: string;
  readonly title: string;
  readonly summary: string;
  readonly tags: readonly string[];
  readonly createdAt: Date;

  private constructor(props: KnowledgeItemProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.url = props.url;
    this.title = props.title;
    this.summary = props.summary;
    this.tags = Object.freeze(props.tags.slice(0, 5));
    this.createdAt = props.createdAt;
  }

  static create(
    props: Omit<KnowledgeItemProps, "id" | "createdAt">,
  ): KnowledgeItem {
    return new KnowledgeItem({
      ...props,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    });
  }

  static reconstitute(props: KnowledgeItemProps): KnowledgeItem {
    return new KnowledgeItem(props);
  }
}
