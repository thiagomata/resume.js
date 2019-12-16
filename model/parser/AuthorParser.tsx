import TitleParser, {ParseElement} from "./TitleParser";
import {Image} from "../interfaces/Image";
import {Profile} from "../interfaces/Profile";
import ProfileParser from "./ProfileParser";
import AuthorBuilder from "../builder/AuthorBuilder";
import {ValidationError, ValidationResult, VoidValidator} from "../interfaces/ValidationError";
import ImageParser from "./ImageParser";
import ParseSettings from "./ParseSettings";
import {Author, Publication} from "../interfaces/Publication";
import InstitutionParser from "./InstitutionParser";

export default class AuthorParser {

    static readonly PARSE_NAME = 'name';
    static readonly PARSE_ABBREVIATION = 'full name';
    static readonly PARSE_EMAIL = [ 'email', 'e-mail' ];
    static readonly PARSE_INSTITUTION = 'phone';
    static readonly PARSE_LINK = 'link';
    static readonly PARSE_AVATAR = 'avatar';
    static readonly PARSE_PROFILES = 'profiles';

    builder: AuthorBuilder = new AuthorBuilder();

    public static parse(content: string): ValidationResult<Author> {
        return new AuthorParser().parse(content);
    }

    public static parseElement(titleTree: ParseElement): ValidationResult<Author> {
        return new AuthorParser().parseElement(titleTree);
    }

    parse(content: string): ValidationResult<Author> {
        let titleTree = TitleParser.parse(content);
        return this.parseElement( titleTree );
    }

    parseElement(titleTree: ParseElement ): ValidationResult<Author> {
        let parseErrors: ValidationError[] = [];
        for (let key in titleTree.elements) {
            let parseResult = this.parseElementKey(key, titleTree.elements[key]);
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
        if (parseKey == AuthorParser.PARSE_NAME && element.content ) {
            this.builder.withName(element.content);
            return {hasErrors: false};
        }
        if (parseKey == AuthorParser.PARSE_ABBREVIATION && element.content ) {
            this.builder.withAbbreviation(element.content);
            return {hasErrors: false};
        }
        if (AuthorParser.PARSE_EMAIL.includes(parseKey) && element.content ) {
            this.builder.withEmail(element.content);
            return {hasErrors: false};
        }
        if (parseKey == AuthorParser.PARSE_INSTITUTION ) {
            const institutionResult =  InstitutionParser.parseElement(element);
            if ( institutionResult.hasErrors ) {
                return institutionResult;
            } else {

            }
            this.builder.withInstitution(
                institutionResult.result
            );
            return {hasErrors: false};
        }
        if (parseKey == AuthorParser.PARSE_LINK && element.content ) {
            this.builder.withLink(element.content);
            return {hasErrors: false};
        }
        if (parseKey == AuthorParser.PARSE_AVATAR) {
            let pictureResult: ValidationResult<Image> = ImageParser.parseElement(element);
            if (pictureResult.hasErrors) {
                return pictureResult;
            } else {
                this.builder.withAvatar(pictureResult.result);
            }
            return {hasErrors: false};
        }
        if (parseKey == AuthorParser.PARSE_PROFILES && element.content ) {
            let profileResult: ValidationResult<Profile[]> = ProfileParser.getProfilesFromParseElement(element);
            if (profileResult.hasErrors) {
                return profileResult;
            } else {
                this.builder.withProfiles(profileResult.result);
            }
            return {hasErrors: false};
        }
        return ParseSettings.unknownParseKey(parseKey,"Author");
    }

    private build(): ValidationResult<Author> {
        return this.builder.build();
    }


    public static parseElementToList(authorsElement: ParseElement): ValidationResult<Author[]> {
        let authors: Author[] = [];
        let allErrors: ValidationError[] = [];
        for( let authorElementKey in authorsElement.elements ) {
            const parseElement = AuthorParser.parseElement( authorsElement.elements[ authorElementKey] );

            if ( parseElement.hasErrors ) {
                allErrors = allErrors.concat(parseElement.errors);
            } else {
                authors.push(parseElement.result);
            }
        }
        if ( allErrors.length ) {
            return {
                hasErrors: true,
                errors: allErrors
            }
        }
        return {
            hasErrors: false,
            result: authors
        };
    }
}