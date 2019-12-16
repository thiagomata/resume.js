import TitleParser, {ParseElement} from "./TitleParser";
import {Image} from "../interfaces/Image";
import institutionBuilder from "../builder/InstitutionBuilder";
import InstitutionBuilder from "../builder/InstitutionBuilder";
import {ValidationError, ValidationResult, VoidValidator} from "../interfaces/ValidationError";
import ImageParser from "./ImageParser";
import ParseSettings from "./ParseSettings";
import {Institution} from "../interfaces/Publication";

export default class InstitutionParser {

    static readonly PARSE_NAME = 'name';
    static readonly PARSE_ABBREVIATION = 'abbreviation';
    static readonly PARSE_EMAIL = [ 'email', 'e-mail' ];
    static readonly PARSE_LINK = 'link';
    static readonly PARSE_ICON = 'icon';

    builder: institutionBuilder = new InstitutionBuilder();

    public static parse(content: string): ValidationResult<Institution> {
        return new InstitutionParser().parse(content);
    }

    public static parseElement(titleTree: ParseElement): ValidationResult<Institution> {
        return new InstitutionParser().parseElement(titleTree);
    }

    public parse(content: string): ValidationResult<Institution> {
        const titleTree: ParseElement = TitleParser.parse(content);
        return this.parseElement(titleTree);
    }

    public parseElement(titleTree: ParseElement): ValidationResult<Institution> {
        let parseErrors: ValidationError[] = [];
        for (let key in titleTree.elements) {
            const parseResult = this.parseElementKey(key, titleTree.elements[key]);
            if (parseResult.hasErrors) {
                parseErrors = parseErrors.concat(parseResult.errors)
            }
        }
        if (parseErrors.length) {
            return {
                hasErrors: true,
                errors: parseErrors
            };
        }
        return this.build();
    }

    private parseElementKey(key: string, element: ParseElement): VoidValidator {
        const parseKey = key.toLowerCase().trim();
        if (parseKey == InstitutionParser.PARSE_NAME && element.content ) {
            this.builder.withName(element.content);
            return {hasErrors: false};
        }
        if (parseKey == InstitutionParser.PARSE_ABBREVIATION && element.content ) {
            this.builder.withAbbreviation(element.content);
            return {hasErrors: false};
        }
        if (InstitutionParser.PARSE_EMAIL.includes(parseKey) && element.content ) {
            this.builder.withEmail(element.content);
            return {hasErrors: false};
        }
        if (parseKey == InstitutionParser.PARSE_LINK && element.content ) {
            this.builder.withLink(element.content);
            return {hasErrors: false};
        }
        if (parseKey == InstitutionParser.PARSE_ICON) {
            const pictureResult: ValidationResult<Image> = ImageParser.parseElement(element);
            if (pictureResult.hasErrors) {
                return pictureResult;
            } else {
                this.builder.withIcon(pictureResult.result);
            }
            return {hasErrors: false};
        }
        return ParseSettings.unknownParseKey(parseKey,"Institution");
    }

    private build(): ValidationResult<Institution> {
        return this.builder.build();
    }
}